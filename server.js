// server.js — Powerhouse Employability Portal (students + staff)

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const methodOverride = require('method-override');
const ejs = require('ejs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// Use /data/data.db if running on Render with a disk
const dbPath = process.env.DATA_DIR
  ? path.join(process.env.DATA_DIR, 'data.db')
  : path.join(__dirname, 'data.db');

const db = new Database(dbPath);
// === CLASSES FEATURE START ===


// Make sure we can handle form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sessions MUST be before any route that uses req.session
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000*60*60*8 }
}));

// Create the classes table if it doesn’t exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )
`).run();


// Always have at least one class
db.prepare(`INSERT OR IGNORE INTO classes (name) VALUES (?)`)
  .run('Powerhouse Group A');

// Share classes with every page (for dropdowns)
app.use((req, res, next) => {
  try {
    const classes = db.prepare('SELECT id, name FROM classes ORDER BY name').all();
    res.locals.classes = classes;
  } catch {
    res.locals.classes = [];
  }
  next();
});

// Add a new class (from admin form)  — now matches your /staff/admin area
app.post('/staff/admin/classes', requireStaff, (req, res) => {
  try {
    // Log what we received so we can see it in Render logs
    console.log('POST /staff/admin/classes body:', req.body);

    // 1) Basic validation
    const raw = (req.body && typeof req.body.name === 'string') ? req.body.name.trim() : '';
    if (!raw) {
      console.warn('Add class: missing name');
      return res.status(400).send('Class name is required');
    }

    // 2) Normalise whitespace and length
    const name = raw.replace(/\s+/g, ' ').slice(0, 100);

    // 3) Insert
    db.prepare('INSERT INTO classes (name) VALUES (?)').run(name);

    // 4) Back to admin
    return res.redirect('/staff/admin');
  } catch (e) {
    const msg = String(e && e.message || e);
    console.error('Create class failed:', msg);

    if (msg.includes('UNIQUE')) {
      return res.status(409).send('That class already exists.');
    }
    // Surface the actual message to help you debug now.
    return res.status(500).send('Internal error creating class: ' + msg);
  }
});



// === CLASSES FEATURE END ===


// ---------- View engine ----------
app.engine('js', ejs.__express);
app.set('view engine', 'js');
app.set('views', path.join(__dirname, 'views'));

// ---------- DB schema ----------
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS staff_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS student_classes (
    student_id INTEGER NOT NULL,
    class_id INTEGER NOT NULL,
    PRIMARY KEY (student_id, class_id),
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS job_passport (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    strengths TEXT DEFAULT '',
    interests TEXT DEFAULT '',
    achievements TEXT DEFAULT '',
    contact_details TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  /* Internal staff job ads list */
  CREATE TABLE IF NOT EXISTS job_ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    pay_per_hour REAL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS self_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    term TEXT DEFAULT '',
    skills_json TEXT NOT NULL,
    reflection TEXT DEFAULT '',
    target TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    term TEXT NOT NULL,
    skills_json TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS staff_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    term TEXT NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cv_data (
  user_id INTEGER PRIMARY KEY,
  full_name TEXT DEFAULT '',
  address TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  personal_statement TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  education_json TEXT DEFAULT '[]',
  work_json TEXT DEFAULT '[]',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

  /* Student progress flags */
  CREATE TABLE IF NOT EXISTS training_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    modules_json TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  /* Catalog of available training modules */
  CREATE TABLE IF NOT EXISTS training_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active INTEGER DEFAULT 1
  );

  /* Per-student resources (shown to students) */
  CREATE TABLE IF NOT EXISTS training_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    url TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    area TEXT DEFAULT '',
    module_key TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  /* Per-module resources (managed by staff; publish copies to training_resources) */
  CREATE TABLE IF NOT EXISTS training_module_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_key TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    area TEXT DEFAULT ''
  );

  /* Public job adverts (student job board) */
  CREATE TABLE IF NOT EXISTS job_adverts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    employer TEXT NOT NULL,
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    closing_date TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    advert_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    employer TEXT,
    role TEXT,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'Submitted',
    cv_path TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (advert_id) REFERENCES job_adverts(id) ON DELETE SET NULL
  );
`);

// ---------- Lightweight migrations ----------
function colExists(table, col) {
  return !!db.prepare(`SELECT 1 FROM pragma_table_info(?) WHERE name=?`).get(table, col);
}
if (!colExists('self_assessments','reflection')) {
  db.exec(`ALTER TABLE self_assessments ADD COLUMN reflection TEXT DEFAULT ''`);
}
if (!colExists('self_assessments','target')) {
  db.exec(`ALTER TABLE self_assessments ADD COLUMN target TEXT DEFAULT ''`);
}
if (!colExists('job_applications','cv_path')) {
  db.exec(`ALTER TABLE job_applications ADD COLUMN cv_path TEXT DEFAULT ''`);
}
/* Area columns for grouping resources (safe if already exist) */
if (!colExists('training_resources','area')) {
  db.exec(`ALTER TABLE training_resources ADD COLUMN area TEXT DEFAULT ''`);
}
if (!colExists('training_module_resources','area')) {
  db.exec(`ALTER TABLE training_module_resources ADD COLUMN area TEXT DEFAULT ''`);
}
/* Track module origin so module delete can clean student copies */
if (!colExists('training_resources','module_key')) {
  db.exec(`ALTER TABLE training_resources ADD COLUMN module_key TEXT DEFAULT ''`);
}
if (!colExists('job_adverts','pay_per_hour')) {
  db.exec(`ALTER TABLE job_adverts ADD COLUMN pay_per_hour REAL`);
}


// ---------- Seed demo data ----------
if (db.prepare('SELECT COUNT(*) AS c FROM users').get().c === 0) {
  const hash = bcrypt.hashSync('password123', 10);
  const ins = db.prepare('INSERT INTO users (username, password_hash, full_name) VALUES (?,?,?)');
  const ids = [
    ins.run('alice', hash, 'Alice Student').lastInsertRowid,
    ins.run('bob',   hash, 'Bob Student').lastInsertRowid
  ];
  const addPassport = db.prepare('INSERT INTO job_passport (user_id) VALUES (?)');
  const addTraining = db.prepare('INSERT INTO training_progress (user_id, modules_json) VALUES (?, ?)');
  const modules = JSON.stringify([
    { key: 'barista',        name: 'Barista Training',     done: false },
    { key: 'food_hygiene_1', name: 'Food Hygiene Level 1', done: false },
    { key: 'food_hygiene_2', name: 'Food Hygiene Level 2', done: false }
  ]);
  ids.forEach(id => { addPassport.run(id); addTraining.run(id, modules); });
}
if (db.prepare('SELECT COUNT(*) AS c FROM staff_users').get().c === 0) {
  const hash = bcrypt.hashSync('teach123', 10);
  db.prepare('INSERT INTO staff_users (username, password_hash, full_name, is_admin) VALUES (?,?,?,1)')
    .run('teacher', hash, 'Test Teacher');
  db.prepare('INSERT INTO classes (name) VALUES (?)').run('Powerhouse Group A');
  const alice = db.prepare('SELECT id FROM users WHERE username=?').get('alice')?.id;
  const bob   = db.prepare('SELECT id FROM users WHERE username=?').get('bob')?.id;
  const classId = db.prepare('SELECT id FROM classes WHERE name=?').get('Powerhouse Group A')?.id;
  if (classId && alice) db.prepare('INSERT OR IGNORE INTO student_classes (student_id, class_id) VALUES (?,?)').run(alice, classId);
  if (classId && bob)   db.prepare('INSERT OR IGNORE INTO student_classes (student_id, class_id) VALUES (?,?)').run(bob, classId);
}
if (db.prepare('SELECT COUNT(*) AS c FROM training_catalog').get().c === 0) {
  const ins = db.prepare('INSERT OR IGNORE INTO training_catalog (key, name, active) VALUES (?,?,1)');
  ins.run('barista',        'Barista Training');
  ins.run('food_hygiene_1', 'Food Hygiene Level 1');
  ins.run('food_hygiene_2', 'Food Hygiene Level 2');
}

// ---------- App middleware ----------
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


// Ensure uploads dir exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
try { fs.mkdirSync(uploadDir, { recursive: true }); } catch {}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname.replace(/[^\w.\-]+/g,'_'))
});
const upload = multer({ storage });

// ---------- Auth helpers ----------
function requireStudent(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  res.locals.user = req.session.user;
  next();
}
function requireStaff(req, res, next) {
  if (!req.session.staff) return res.redirect('/staff/login');
  res.locals.staff = req.session.staff;
  next();
}

// ---------- Constants ----------
const SKILLS = [
  { key: 'timekeeping',            name: 'Timekeeping' },
  { key: 'teamwork',               name: 'Teamwork' },
  { key: 'communication',          name: 'Communication' },
  { key: 'problem_solving',        name: 'Problem Solving' },
  { key: 'following_instructions', name: 'Following Instructions' },
  { key: 'customer_service',       name: 'Customer Service' }
];
const TERMS = ['Autumn','Spring','Summer'];
const AREAS = ['Kitchen','Warehouse','Bar','Restaurant','Barista','Office'];

/* =========================
   STUDENT
   ========================= */

// Home
app.get('/', (req,res)=> req.session.user ? res.redirect('/home') : res.redirect('/login'));
app.get('/login', (req,res)=> res.render('login', { error: null }));
app.post('/login', (req,res)=>{
  const { username, password } = req.body;
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!u || !bcrypt.compareSync(password, u.password_hash)) {
    return res.status(401).render('login', { error: 'Invalid username or password' });
  }
  req.session.user = { id: u.id, username: u.username, full_name: u.full_name };
  res.redirect('/home');
});
app.post('/logout', (req,res)=> req.session.destroy(()=> res.redirect('/login')));

app.get('/home', requireStudent, (req,res)=>{
  const row = db.prepare('SELECT * FROM self_assessments WHERE user_id=? ORDER BY created_at DESC').get(req.session.user.id);
  let latest = {};
  if (row) { try { latest = JSON.parse(row.skills_json) } catch(e){} }
  const pathData = SKILLS.map(s => ({ ...s, score: latest[s.key] || 0 }));

  const latestReview = db.prepare(`
    SELECT sa.term, sa.created_at, sa.reflection, sa.target,
           (SELECT comment FROM staff_comments sc
             WHERE sc.student_id=sa.user_id AND sc.term=sa.term
             ORDER BY sc.created_at DESC LIMIT 1) AS staff_comment
    FROM self_assessments sa WHERE sa.user_id=?
    ORDER BY sa.created_at DESC LIMIT 1
  `).get(req.session.user.id);

  res.render('home', { skills: pathData, latestReview, terms: TERMS });
});

// Self-Assessment
// Self-Assessment
app.get('/self-assessment', requireStudent, (req,res)=>{
  const latest = db.prepare('SELECT * FROM self_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.session.user.id);
  const history = db.prepare('SELECT * FROM self_assessments WHERE user_id=? ORDER BY created_at DESC').all(req.session.user.id);
  const staffLatest = db.prepare('SELECT * FROM staff_assessments WHERE student_id=? ORDER BY created_at DESC LIMIT 1').get(req.session.user.id);

  // NEW: latest staff comment (prefer comment that matches student's latest term; otherwise latest overall)
  let latestStaffComment = null;
  if (latest && latest.term) {
    latestStaffComment = db.prepare(`
      SELECT * FROM staff_comments
      WHERE student_id=? AND term=?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.session.user.id, latest.term);
  }
  if (!latestStaffComment) {
    latestStaffComment = db.prepare(`
      SELECT * FROM staff_comments
      WHERE student_id=?
      ORDER BY created_at DESC
      LIMIT 1
    `).get(req.session.user.id);
  }

  res.render('self-assessment', {
    skills: SKILLS,
    terms: TERMS,
    latest,
    history,
    staffLatest,
    latestStaffComment   // pass to view
  });
});

app.post('/self-assessment', requireStudent, (req,res)=>{
  const latest = db.prepare('SELECT id FROM self_assessments WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.session.user.id);
  if (latest) return res.redirect('/self-assessment');

  const data = {};
  SKILLS.forEach(s => {
    const v = parseInt(req.body[s.key], 10);
    data[s.key] = isNaN(v) ? null : Math.min(5, Math.max(1, v));
  });
  const term = req.body.term || '';
const theReflection = req.body.reflection || '';
const theTarget = req.body.target || '';
  db.prepare('INSERT INTO self_assessments (user_id, term, skills_json, reflection, target) VALUES (?,?,?,?,?)')
    .run(req.session.user.id, term, JSON.stringify(data), theReflection, theTarget);
  res.redirect('/self-assessment');
});
app.post('/self-assessment/:id/delete', requireStudent, (req,res)=>{
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM self_assessments WHERE id=? AND user_id=?').run(id, req.session.user.id);
  res.redirect('/self-assessment');
});

// Training (student) — groups teacher resources by Area
app.get('/training', requireStudent, (req, res) => {
  const prog = db.prepare('SELECT modules_json FROM training_progress WHERE user_id=?')
    .get(req.session.user.id);

  let modules = [];
  try {
    if (prog && prog.modules_json) {
      const val = typeof prog.modules_json === 'string'
        ? JSON.parse(prog.modules_json)
        : prog.modules_json;
      modules = Array.isArray(val) ? val : [];
    }
  } catch { modules = []; }

  const catalog = db.prepare('SELECT key, name FROM training_catalog WHERE active=1 ORDER BY id').all();
  const byKey = new Map(modules.map(m => [m.key, m]));
  const ordered = catalog.map(c => byKey.get(c.key) || { key: c.key, name: c.name, done: false });

  const rows = db.prepare(`
    SELECT * FROM training_resources
    WHERE user_id=?
    ORDER BY CASE WHEN area='' THEN 1 ELSE 0 END, area, created_at DESC
  `).all(req.session.user.id);

  const byArea = Object.fromEntries(AREAS.map(a => [a, []]));
  const misc = [];
  rows.forEach(r => {
    const a = (r.area || '').trim();
    if (AREAS.includes(a)) byArea[a].push(r);
    else misc.push(r);
  });

  res.render('training', {
    modules: ordered,
    resourcesByArea: byArea,
    miscResources: misc,
    catalog,
    AREAS
  });
});
app.post('/training', requireStudent, (req, res) => {
  const catalog = db.prepare('SELECT key, name FROM training_catalog WHERE active=1 ORDER BY id').all();
  const modules = catalog.map(c => ({
    key: c.key, name: c.name, done: !!req.body[`mod_${c.key}`]
  }));
  db.prepare(`
    INSERT INTO training_progress (user_id, modules_json)
    VALUES (?, ?)
    ON CONFLICT(user_id) DO UPDATE SET modules_json = excluded.modules_json
  `).run(req.session.user.id, JSON.stringify(modules));
  res.redirect('/training');
});

// Job board / Apply (student)
app.get('/job-board', requireStudent, (req,res)=>{
  const adverts = db.prepare('SELECT * FROM job_adverts ORDER BY closing_date DESC, id DESC').all();
  const myApps = db.prepare('SELECT advert_id, status, created_at FROM job_applications WHERE user_id=?')
    .all(req.session.user.id);
  const appMap = new Map(myApps.map(a => [a.advert_id, a]));
  res.render('job-board', { adverts, appMap });
});
app.get('/apply/:id', requireStudent, (req,res)=>{
  const ad = db.prepare('SELECT * FROM job_adverts WHERE id=?').get(req.params.id);
  if (!ad) return res.redirect('/job-board');
  const existing = db.prepare('SELECT * FROM job_applications WHERE user_id=? AND advert_id=? ORDER BY created_at DESC LIMIT 1')
    .get(req.session.user.id, ad.id);
  res.render('apply', { ad, existing });
});
app.post('/apply/:id', requireStudent, upload.single('cv_file'), (req,res)=>{
  const ad = db.prepare('SELECT * FROM job_adverts WHERE id=?').get(req.params.id);
  if (!ad) return res.redirect('/job-board');
  const { full_name, email, why } = req.body;
  const cv_path = req.file ? '/uploads/' + path.basename(req.file.path) : '';
  const notes = `Applicant: ${full_name||''} ${email?`<${email}>`:''}\n\nStatement:\n${why||''}`;
  db.prepare('INSERT INTO job_applications (user_id, advert_id, employer, role, notes, status, cv_path) VALUES (?,?,?,?,?,?,?)')
    .run(req.session.user.id, ad.id, ad.employer, ad.title, notes, 'Submitted', cv_path);
  res.redirect('/job-board');
});

// CV Builder (student)
app.get('/cv-builder', requireStudent, (req, res) => {
  const row = db.prepare('SELECT * FROM cv_data WHERE user_id=?').get(req.session.user.id) || {};
  let data = {
    full_name: row.full_name || req.session.user.full_name || '',
    address: row.address || '',
    email: row.email || '',
    phone: row.phone || '',
    personal_statement: row.personal_statement || '',
    skills: row.skills || '',
    education: row.education_json ? JSON.parse(row.education_json) : [],
    work: row.work_json ? JSON.parse(row.work_json) : []
  };
  if (req.query.cleared === '1') {
    data = { full_name:'', address:'', email:'', phone:'', personal_statement:'', skills:'', education:[], work:[] };
    res.set('Cache-Control', 'no-store');
  }
  res.render('cv-builder', { active: 'cv', user: req.session.user, data });
});
app.post('/cv-builder', requireStudent, (req, res) => {
  const edu = [];
  for (let i=0;i<3;i++){
    if (req.body[`edu_qualification_${i}`] || req.body[`edu_institution_${i}`] || req.body[`edu_dates_${i}`]) {
      edu.push({
        qualification: req.body[`edu_qualification_${i}`] || '',
        institution: req.body[`edu_institution_${i}`] || '',
        dates: req.body[`edu_dates_${i}`] || ''
      });
    }
  }
  const work = [];
  for (let i=0;i<3;i++){
    if (req.body[`work_role_${i}`] || req.body[`work_employer_${i}`] || req.body[`work_dates_${i}`] || req.body[`work_details_${i}`]) {
      work.push({
        role: req.body[`work_role_${i}`] || '',
        employer: req.body[`work_employer_${i}`] || '',
        dates: req.body[`work_dates_${i}`] || '',
        details: req.body[`work_details_${i}`] || ''
      });
    }
  }
  db.prepare(`
    INSERT INTO cv_data (user_id, full_name, address, email, phone, personal_statement, skills, education_json, work_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      full_name=excluded.full_name,
      address=excluded.address,
      email=excluded.email,
      phone=excluded.phone,
      personal_statement=excluded.personal_statement,
      skills=excluded.skills,
      education_json=excluded.education_json,
      work_json=excluded.work_json
  `).run(
    req.session.user.id,
    req.body.full_name || req.session.user.full_name || '',
    req.body.address || '',
    req.body.email || '',
    req.body.phone || '',
    req.body.personal_statement || '',
    req.body.skills || '',
    JSON.stringify(edu),
    JSON.stringify(work)
  );
  res.redirect('/cv-builder');
});
app.post('/cv-builder/build-doc', requireStudent, async (req, res) => {
  const row = db.prepare('SELECT * FROM cv_data WHERE user_id=?').get(req.session.user.id);
  const docx = require('docx');
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = docx;
  const para = (text, opts={}) => new Paragraph({ children: [new TextRun({ text, ...opts })] });
  const heading = (text) => new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } });
  const education = row?.education_json ? JSON.parse(row.education_json) : [];
  const work = row?.work_json ? JSON.parse(row.work_json) : [];
  const skillsList = (row?.skills || '').split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  const sections = [];
  sections.push(
    new Paragraph({ text: (row?.full_name || req.session.user.full_name || 'CV'), heading: HeadingLevel.TITLE, spacing: { after: 100 } }),
    para(`${row?.address || ''}`),
    para([row?.email, row?.phone].filter(Boolean).join(' • '))
  );
  if (row?.personal_statement) sections.push(heading('Personal Statement'), para(row.personal_statement));
  if (skillsList.length) { sections.push(heading('Skills')); skillsList.forEach(s => sections.push(para('• ' + s))); }
  if (education.length) { sections.push(heading('Education')); education.forEach(e => sections.push(para([e.qualification, e.institution, e.dates].filter(Boolean).join(' — ')))); }
 if (work.length) {
  sections.push(heading('Work Experience'));
  work.forEach(w => { 
    sections.push(para([w.role, w.employer, w.dates].filter(Boolean).join(' — '))); 
    if (w.details) sections.push(para('  ' + w.details)); 
  });
}

  sections.push(heading('References'), para('Available on request.'));
  const doc = new Document({ sections: [{ properties: {}, children: sections }] });
  const buffer = await Packer.toBuffer(doc);
  const filename = `${(row?.full_name || req.session.user.full_name || 'CV').replace(/\s+/g,'_')}_CV.docx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
});
app.post('/cv-builder/reset', requireStudent, (req, res) => {
  db.prepare('DELETE FROM cv_data WHERE user_id=?').run(req.session.user.id);
  res.redirect('/cv-builder?cleared=1');
});

/* =========================
   STAFF
   ========================= */

// Staff auth
app.get('/staff/login', (req,res)=> res.render('staff/login', { error: null }));
app.post('/staff/login', (req,res)=>{
  const { username, password } = req.body;
  const st = db.prepare('SELECT * FROM staff_users WHERE username=?').get(username);
  if (!st || !bcrypt.compareSync(password, st.password_hash)) {
    return res.status(401).render('staff/login', { error: 'Invalid username or password' });
  }
  req.session.staff = { id: st.id, username: st.username, full_name: st.full_name, is_admin: !!st.is_admin };
  res.redirect('/staff/dashboard');
});
app.post('/staff/logout', (req,res)=> req.session.destroy(()=> res.redirect('/staff/login')));

// Staff: Dashboard
app.get('/staff/dashboard', requireStaff, (req,res)=>{
  const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const classId = req.query.class_id ? parseInt(req.query.class_id, 10) : (classes[0]?.id || null);

  let students = [];
  if (classId) {
    students = db.prepare(`
      SELECT u.*
      FROM users u
      JOIN student_classes sc ON sc.student_id = u.id
      WHERE sc.class_id = ?
      ORDER BY u.full_name
    `).all(classId);
  }

  const userNames = {};
  (students || []).forEach(s => { userNames[s.id] = s.full_name; });

  const recentApps = db.prepare(`
    SELECT ja.*, u.full_name, u.id AS student_id
    FROM job_applications ja
    JOIN users u ON u.id = ja.user_id
    ${classId ? 'JOIN student_classes sc ON sc.student_id = u.id WHERE sc.class_id = ?' : ''}
    ORDER BY ja.created_at DESC
    LIMIT 20
  `).all(...(classId ? [classId] : []));

  const latestSelf = db.prepare(`
    SELECT sa.*, u.full_name, u.id AS student_id
    FROM self_assessments sa
    JOIN users u ON u.id = sa.user_id
    ${classId ? 'JOIN student_classes sc ON sc.student_id = u.id WHERE sc.class_id = ?' : ''}
    ORDER BY sa.created_at DESC
    LIMIT 20
  `).all(...(classId ? [classId] : []));

  res.render('staff/dashboard', { classes, classId, students, recentApps, latestSelf, userNames, active: 'dashboard' });
});

// Staff: Student profile
app.get('/staff/student/:id', requireStaff, (req,res)=>{
  const student = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
  if (!student) return res.redirect('/staff/dashboard');

  const selfRows  = db.prepare('SELECT * FROM self_assessments WHERE user_id=? ORDER BY created_at DESC').all(student.id);
  const staffRows = db.prepare('SELECT * FROM staff_assessments WHERE student_id=? ORDER BY created_at DESC').all(student.id);
  const comments  = db.prepare('SELECT * FROM staff_comments WHERE student_id=? ORDER BY created_at DESC').all(student.id);
  const apps      = db.prepare(`
    SELECT ja.*, ja.role AS job_role, ja.id AS app_id, a.title AS advert_title
    FROM job_applications ja
    LEFT JOIN job_adverts a ON a.id = ja.advert_id
    WHERE ja.user_id=?
    ORDER BY ja.created_at DESC
  `).all(student.id);

  const classes = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const inClass = db.prepare('SELECT class_id FROM student_classes WHERE student_id=?').get(student.id);

  const latestSelf  = selfRows[0] || null;
  const latestStaff = staffRows[0] || null;

  const resources = db.prepare('SELECT * FROM training_resources WHERE user_id=? ORDER BY created_at DESC')
    .all(student.id);

  res.render('staff/student', { student, selfRows, staffRows, comments, apps, classes, inClass, latestSelf, latestStaff, skills: SKILLS, terms: TERMS, resources });
});
app.post('/staff/student/:id/assess', requireStaff, (req,res)=>{
  const studentId = parseInt(req.params.id, 10);
  const term = req.body.term || 'Autumn';
  const data = {};
  SKILLS.forEach(s => {
    const v = parseInt(req.body[s.key], 10);
    data[s.key] = isNaN(v) ? null : Math.min(5, Math.max(1, v));
  });
  db.prepare('INSERT INTO staff_assessments (student_id, staff_id, term, skills_json) VALUES (?,?,?,?)')
    .run(studentId, req.session.staff.id, term, JSON.stringify(data));
  res.redirect('/staff/student/' + studentId);
});
app.post('/staff/student/:id/comment', requireStaff, (req,res)=>{
  const studentId = parseInt(req.params.id, 10);
  const term = req.body.term || 'Autumn';
  const comment = req.body.comment || '';
  db.prepare('INSERT INTO staff_comments (student_id, staff_id, term, comment) VALUES (?,?,?,?)')
    .run(studentId, req.session.staff.id, term, comment);
  res.redirect('/staff/student/' + studentId);
});

// Staff: add/delete per-student training resources
app.post('/staff/student/:id/resource', requireStaff, upload.single('file'), (req,res)=>{
  const studentId = parseInt(req.params.id, 10);
  const { title, url } = req.body;
  const file_path = req.file ? '/uploads/' + path.basename(req.file.path) : '';
  if (!title || (!url && !file_path)) return res.redirect('/staff/student/' + studentId);
  db.prepare('INSERT INTO training_resources (user_id, title, url, file_path) VALUES (?,?,?,?)')
    .run(studentId, title, url||'', file_path);
  res.redirect('/staff/student/' + studentId);
});
app.post('/staff/student/:id/resource/:rid/delete', requireStaff, (req,res)=>{
  const studentId = parseInt(req.params.id, 10);
  const rid = parseInt(req.params.rid, 10);
  db.prepare('DELETE FROM training_resources WHERE id=? AND user_id=?').run(rid, studentId);
  res.redirect('/staff/student/' + studentId);
});

// Staff: Admin (training section removed)
app.get('/staff/admin', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/dashboard');

  const classes  = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const classId = req.query.class_id ? parseInt(req.query.class_id, 10) : null;

  let students;
  if (classId) {
    students = db.prepare(`
      SELECT u.*, sc.class_id
      FROM users u
      JOIN student_classes sc ON sc.student_id = u.id
      WHERE sc.class_id = ?
      ORDER BY u.full_name
    `).all(classId);
  } else {
    students = db.prepare(`
      SELECT u.*, sc.class_id
      FROM users u
      LEFT JOIN student_classes sc ON sc.student_id = u.id
      ORDER BY u.full_name
    `).all();
  }

  const staff = db.prepare('SELECT id, username, full_name, is_admin FROM staff_users ORDER BY full_name').all();

  res.render('staff/admin', { classes, classId, students, staff, active: 'admin' });
});

// Admin ops
app.post('/staff/admin/create-student', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const { username, password, full_name, class_id } = req.body;
  if (!username || !password || !full_name) return res.redirect('/staff/admin');
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, full_name) VALUES (?,?,?)')
    .run(username.trim(), hash, full_name.trim());
  if (class_id) {
    db.prepare('INSERT OR IGNORE INTO student_classes (student_id, class_id) VALUES (?,?)')
      .run(info.lastInsertRowid, parseInt(class_id,10));
  }
  db.prepare('INSERT INTO job_passport (user_id) VALUES (?)').run(info.lastInsertRowid);
  const defaultMods = JSON.stringify([
    { key: 'barista',        name: 'Barista Training',     done: false },
    { key: 'food_hygiene_1', name: 'Food Hygiene Level 1', done: false },
    { key: 'food_hygiene_2', name: 'Food Hygiene Level 2', done: false }
  ]);
  db.prepare('INSERT INTO training_progress (user_id, modules_json) VALUES (?,?)')
    .run(info.lastInsertRowid, defaultMods);
  res.redirect('/staff/admin');
});
app.post('/staff/admin/student/:id/update', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const id = parseInt(req.params.id, 10);
  const { full_name, username } = req.body;
  if (full_name) db.prepare('UPDATE users SET full_name=? WHERE id=?').run(full_name.trim(), id);
  if (username)  db.prepare('UPDATE users SET username=? WHERE id=?').run(username.trim(), id);
  res.redirect('/staff/admin');
});
app.post('/staff/admin/student/:id/reset-password', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const id = parseInt(req.params.id, 10);
  const { password } = req.body;
  if (!password) return res.redirect('/staff/admin');
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(hash, id);
  res.redirect('/staff/admin');
});
app.post('/staff/admin/student/:id/move', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const studentId = parseInt(req.params.id, 10);
  const classId = parseInt(req.body.class_id, 10);
  if (!classId) return res.redirect('/staff/admin');
  db.prepare('DELETE FROM student_classes WHERE student_id=?').run(studentId);
  db.prepare('INSERT INTO student_classes (student_id, class_id) VALUES (?,?)').run(studentId, classId);
  res.redirect('/staff/admin');
});
app.post('/staff/admin/student/:id/delete', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  res.redirect('/staff/admin');
});

// Staff: Jobs (internal)
// Staff: Jobs (internal) — now shows job_adverts so students see the same list
app.get('/staff/jobs', requireStaff, (req,res)=>{
  const ads = db.prepare(`
    SELECT id, title, employer, location, description, closing_date, pay_per_hour, created_at
    FROM job_adverts
    ORDER BY created_at DESC, id DESC
  `).all();
  res.render('staff/jobs', { ads, active: 'jobs', staff: req.session.staff });
});

app.post('/staff/jobs/create', requireStaff, (req,res)=>{
  const { title, description, employer, location, closing_date, pay_per_hour } = req.body;
  if (!title) return res.redirect('/staff/jobs');

  const pay = (pay_per_hour && !Number.isNaN(parseFloat(pay_per_hour))) ? parseFloat(pay_per_hour) : null;
  const emp = (employer || '').trim();           // optional
  const loc = (location || '').trim();           // optional
  const close = (closing_date || '').trim();     // optional (YYYY-MM-DD)

  db.prepare(`
    INSERT INTO job_adverts (title, employer, location, description, closing_date, pay_per_hour, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(title.trim(), emp, loc, description || '', close, pay);

  res.redirect('/staff/jobs');
});

app.post('/staff/jobs/:id/delete', requireStaff, (req,res)=>{
  db.prepare('DELETE FROM job_adverts WHERE id=?').run(parseInt(req.params.id,10));
  res.redirect('/staff/jobs');
});

app.post('/staff/applications/:id/status', requireStaff, (req,res)=>{
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!['Submitted','In Review','Accepted','Declined'].includes(status)) return res.redirect('/staff/dashboard');
  db.prepare('UPDATE job_applications SET status=? WHERE id=?').run(status, id);
  res.redirect('/staff/dashboard');
});
app.post('/staff/applications/:id/delete', requireStaff, (req,res)=>{
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM job_applications WHERE id=?').run(id);
  res.redirect('/staff/dashboard');
});

/* ===== STAFF TRAINING PAGE (separate from Admin) ===== */

// List page
app.get('/staff/training', requireStaff, (req,res)=>{
  const classes  = db.prepare('SELECT * FROM classes ORDER BY name').all();
  const modules  = db.prepare('SELECT * FROM training_catalog ORDER BY id').all();
  const modResRows = db.prepare('SELECT * FROM training_module_resources ORDER BY created_at DESC').all();
  const moduleResources = {};
  modResRows.forEach(r => {
    if (!moduleResources[r.module_key]) moduleResources[r.module_key] = [];
    moduleResources[r.module_key].push(r);
  });
  res.render('staff/training', { classes, modules, moduleResources, active: 'staff-training', staff: req.session.staff });
});

// Add module
app.post('/staff/training/modules', requireStaff, (req,res)=>{
  const { module_key, module_name } = req.body || {};
  if (!module_key || !module_name) return res.redirect('/staff/training');
  try {
    db.prepare('INSERT INTO training_catalog (key, name, active) VALUES (?,?,1)')
      .run(module_key.trim(), module_name.trim());
  } catch(e){ /* duplicate -> ignore */ }
  res.redirect('/staff/training');
});

// Add resource to a module (with Area)
app.post('/staff/training/modules/:moduleKey/resource', requireStaff, upload.single('file'), (req,res)=>{
  const moduleKey = req.params.moduleKey;
  const { title, url, area } = req.body || {};
  const file_path = req.file ? '/uploads/' + path.basename(req.file.path) : '';
  if (!title || (!url && !file_path)) return res.redirect('/staff/training');
  db.prepare(`
    INSERT INTO training_module_resources (module_key, title, url, file_path, area, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `).run(moduleKey, title.trim(), (url||'').trim() || '', file_path, area||'');
  res.redirect('/staff/training');
});

// Delete a module resource
app.post('/staff/training/modules/:moduleKey/resource/:id/delete', requireStaff, (req,res)=>{
  const id = parseInt(req.params.id, 10);
  db.prepare('DELETE FROM training_module_resources WHERE id=?').run(id);
  res.redirect('/staff/training');
});

// Publish module resources to all students in a class (preserves Area + tracks module_key)
app.post('/staff/training/modules/:moduleKey/publish', requireStaff, (req,res)=>{
  const moduleKey = req.params.moduleKey;
  const classId = parseInt(req.body.class_id, 10);
  if (!classId) return res.redirect('/staff/training');

  const students = db.prepare(`
    SELECT u.id as student_id
    FROM users u
    JOIN student_classes sc ON sc.student_id = u.id
    WHERE sc.class_id = ?
    ORDER BY u.full_name
  `).all(classId);

  const resources = db.prepare('SELECT * FROM training_module_resources WHERE module_key = ?').all(moduleKey);

  const ins = db.prepare(`
    INSERT INTO training_resources (user_id, title, url, file_path, area, module_key)
    VALUES (?,?,?,?,?,?)
  `);
  const tx = db.transaction((rows, rescs) => {
    rows.forEach(st => {
      rescs.forEach(r => {
        ins.run(st.student_id, r.title, r.url||'', r.file_path||'', r.area||'', moduleKey);
      });
    });
  });
  tx(students, resources);

  res.redirect('/staff/training');
});

// Delete a module entirely (and all related resources, including student copies)
app.post('/staff/training/modules/:moduleKey/delete', requireStaff, (req,res)=>{
  const moduleKey = req.params.moduleKey;
  const tx = db.transaction((key)=>{
    db.prepare('DELETE FROM training_resources WHERE module_key=?').run(key);
    db.prepare('DELETE FROM training_module_resources WHERE module_key=?').run(key);
    db.prepare('DELETE FROM training_catalog WHERE key=?').run(key);
  });
  tx(moduleKey);
  res.redirect('/staff/training');
});

/* ===== (Optional) ADMIN training routes kept for compatibility — now with Area + module_key on publish ===== */
app.post('/staff/admin/modules/:key/resource', requireStaff, upload.single('file'), (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const module_key = req.params.key;
  const { title, url, area } = req.body;
  const file_path = req.file ? '/uploads/' + path.basename(req.file.path) : '';
  if (!title || (!url && !file_path)) return res.redirect('/staff/admin');
  db.prepare('INSERT INTO training_module_resources (module_key, title, url, file_path, area) VALUES (?,?,?,?,?)')
    .run(module_key, title, url||'', file_path, area||'');
  res.redirect('/staff/admin');
});
app.post('/staff/admin/modules/:key/resource/:rid/delete', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const rid = parseInt(req.params.rid, 10);
  db.prepare('DELETE FROM training_module_resources WHERE id=?').run(rid);
  res.redirect('/staff/admin');
});
app.post('/staff/admin/modules/:key/publish', requireStaff, (req,res)=>{
  if (!req.session.staff.is_admin) return res.redirect('/staff/admin');
  const module_key = req.params.key;
  const class_id = parseInt(req.body.class_id, 10);
  if (!class_id) return res.redirect('/staff/admin');

  const students = db.prepare(`
    SELECT u.id FROM users u
    JOIN student_classes sc ON sc.student_id = u.id
    WHERE sc.class_id = ?
  `).all(class_id);

  const resources = db.prepare('SELECT * FROM training_module_resources WHERE module_key=?').all(module_key);
  const ins = db.prepare(`
    INSERT INTO training_resources (user_id, title, url, file_path, area, module_key)
    VALUES (?,?,?,?,?,?)
  `);

  const tx = db.transaction((rows, rescs) => {
    rows.forEach(st => {
      rescs.forEach(r => {
        ins.run(st.id, r.title, r.url||'', r.file_path||'', r.area||'', module_key);
      });
    });
  });
  tx(students, resources);

  res.redirect('/staff/admin');
});

// ---------- 404 ----------
app.use((req,res)=> res.status(404).render('404'));

// ---------- Start ----------
app.listen(PORT, ()=> console.log(`Powerhouse portal running at http://localhost:${PORT}`));
