<%
  const title  = 'Student Profile';
  const active = 'staff-dashboard';

  // Use different local names so we don't shadow server-provided vars
  const latestSelfRow  = (typeof latestSelf !== 'undefined' && latestSelf) ? latestSelf : ((selfRows && selfRows[0]) || null);
  const latestStaffRow = (typeof latestStaff !== 'undefined' && latestStaff) ? latestStaff : ((staffRows && staffRows[0]) || null);

  // Prep radar data
  const labels = (skills||[]).map(s => s.name);
  let stuScores = [];
  let staffScores = [];
  try {
    const s = (latestSelfRow && latestSelfRow.skills_json) ? JSON.parse(latestSelfRow.skills_json) : {};
    stuScores = (skills||[]).map(k => s[k.key] ?? null);
  } catch(e){ stuScores = (skills||[]).map(()=>null); }
  try {
    const t = (latestStaffRow && latestStaffRow.skills_json) ? JSON.parse(latestStaffRow.skills_json) : {};
    staffScores = (skills||[]).map(k => t[k.key] ?? null);
  } catch(e){ staffScores = (skills||[]).map(()=>null); }
%>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="staff-student">
  <style>
    #staff-student .wrap { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    #staff-student h1 { margin:.25rem 0 1rem 0; }
    #staff-student .muted { color:#6b7280; }
    #staff-student .pill { display:inline-block; padding:2px 8px; border-radius:999px; background:#f3f4f6; font-size:.85rem; }

    .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
    .card-tight { padding:0; overflow:hidden; }
    .card-section { padding:14px; }

    .btn {
      background:#6d28d9; color:#fff; border:1px solid #6d28d9;
      border-radius:10px; padding:9px 12px; font-weight:600; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
      transition: background .2s, border-color .2s; text-decoration:none; white-space:nowrap;
    }
    .btn:hover { background:#5b21b6; border-color:#5b21b6; }
    .btn.outline { background:#fff; color:#6d28d9; }

    label { display:block; font-weight:600; margin:.25rem 0 .35rem; }
    select, textarea, input[type="text"], input[type="url"], input[type="file"] {
      width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; box-sizing:border-box; display:block; font: inherit;
    }
    textarea { min-height:110px; resize:vertical; }

    table { width:100%; border-collapse: collapse; }
    th, td { text-align:left; padding:10px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
    th { background:#f9fafb; font-weight:700; }

    .grid-2 { display:grid; grid-template-columns: 1.05fr 1fr; gap:12px; }
    .grid-3 { display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; }
    @media (max-width: 980px){ .grid-2, .grid-3 { grid-template-columns: 1fr; } }

    .skills-list { display:flex; flex-direction:column; gap:.5rem; }
    .skill-row { display:grid; grid-template-columns: 1fr 280px; align-items:center; gap:.75rem; }
    .scale-inputs { display:grid; grid-template-columns: repeat(5, 1fr); gap:.5rem; }
    .scale-cell { display:flex; align-items:center; justify-content:center; }
    .scale-cell input[type="radio"] { position:absolute; opacity:0; width:0; height:0; }
    .scale-cell .dot { width:16px; height:16px; border-radius:50%; border:2px solid #93c5fd; display:inline-block; }
    .scale-cell input[type="radio"]:checked + .dot { background:#10b981; border-color:#10b981; }

    .vspace-s { margin-top:.5rem; }
    .vspace { margin-top:.75rem; }
    .vspace-l { margin-top:1rem; }
    .practical-summary { display:grid; grid-template-columns:180px 1fr; gap:12px; align-items:stretch; }
    .practical-score { border-radius:12px; background:#f5f3ff; border:1px solid #ddd6fe; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:16px; }
    .practical-score strong { font-size:2.3rem; color:#5b21b6; line-height:1; }
    .practical-cats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
    .practical-cat { border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
    .practical-track { height:8px; border-radius:999px; overflow:hidden; background:#e5e7eb; margin-top:7px; }
    .practical-fill { height:100%; background:#6d28d9; border-radius:999px; }
    .support-badge { display:inline-block; padding:4px 8px; border-radius:999px; font-size:.8rem; font-weight:700; }
    .support-1 { background:#fee2e2; color:#991b1b; }
    .support-2 { background:#ffedd5; color:#9a3412; }
    .support-3 { background:#fef3c7; color:#92400e; }
    .support-4 { background:#dcfce7; color:#166534; }
    @media(max-width:720px){ .practical-summary{grid-template-columns:1fr;} .practical-cats{grid-template-columns:1fr;} }
  </style>

  <div class="wrap">
    <!-- Header -->
    <div class="card">
      <h1 style="margin:.2rem 0 .5rem 0;"><%= student.full_name %></h1>
      <div class="muted">
        Username: <strong><%= student.username %></strong>
        <% if (inClass && inClass.class_id) { %>
          • Class: <strong><% const cls = (classes||[]).find(c => c.id === inClass.class_id); %><%= cls ? cls.name : '—' %></strong>
        <% } %>
      </div>
    </div>

    <div class="vspace"></div>

    <div class="grid-2">
      <!-- LEFT: Staff assessment + comment -->
      <div class="card">
        <h2 style="margin-top:0">Staff assessment</h2>
        <form method="post" action="/staff/student/<%= student.id %>/assess">
          <label>Term</label>
          <select name="term">
            <% (terms || []).forEach(t => { %>
              <option value="<%= t %>"><%= t %></option>
            <% }) %>
          </select>

          <div class="skills-list vspace-s">
            <% (skills || []).forEach(s => { %>
              <div class="skill-row">
                <div style="font-weight:600;"><%= s.name %></div>
                <div class="scale-inputs" role="group" aria-label="<%= s.name %> score">
                  <% for (let i=1;i<=5;i++){ %>
                    <label class="scale-cell">
                      <input type="radio" name="<%= s.key %>" value="<%= i %>" required>
                      <span class="dot" aria-hidden="true"></span>
                    </label>
                  <% } %>
                </div>
              </div>
            <% }) %>
          </div>

          <div class="vspace">
            <button class="btn" type="submit">Save staff assessment</button>
          </div>
        </form>

        <div class="vspace-l"></div>

        <h2 style="margin-top:0">Staff comment</h2>
        <form method="post" action="/staff/student/<%= student.id %>/comment">
          <label>Term</label>
          <select name="term">
            <% (terms || []).forEach(t => { %>
              <option value="<%= t %>"><%= t %></option>
            <% }) %>
          </select>

          <div class="vspace-s">
            <label>Comment</label>
            <textarea name="comment" placeholder="Constructive summary of progress and next steps"></textarea>
          </div>

          <div class="vspace">
            <button class="btn" type="submit">Add comment</button>
          </div>
        </form>
      </div>

      <!-- RIGHT: Radar + latest tables -->
      <div class="card">
        <h2 style="margin-top:0">Scores overview</h2>

        <div class="card card-tight vspace-s">
          <div class="card-section">
            <h3 style="margin:0 0 .5rem 0; font-size:1.05rem;">Student vs Staff</h3>
          </div>
          <div class="card-section" style="padding-top:0;">
            <canvas id="saRadar" aria-label="Radar chart of skills" role="img"></canvas>
          </div>
        </div>

        <div class="grid-2 vspace">
          <div>
            <h3 style="margin:.25rem 0;">Latest student self-assessment</h3>
            <% if (!latestSelfRow) { %>
              <p class="muted">No student self-assessment yet.</p>
            <% } else { 
                 let sObj = {};
                 try { sObj = JSON.parse(latestSelfRow.skills_json || '{}') } catch(e) {}
            %>
              <p class="muted">
                <span class="pill"><%= latestSelfRow.term || '—' %></span>
                <span style="margin-left:8px;"><%= new Date(latestSelfRow.created_at).toLocaleString() %></span>
              </p>
              <table class="vspace-s">
                <thead><tr><th>Skill</th><th>Score</th></tr></thead>
                <tbody>
                  <% (skills||[]).forEach(function(s){ %>
                    <tr><td><%= s.name %></td><td><%= sObj[s.key] ?? '—' %></td></tr>
                  <% }) %>
                </tbody>
              </table>
            <% } %>
          </div>

          <div>
            <h3 style="margin:.25rem 0;">Latest staff assessment</h3>
            <% if (!latestStaffRow) { %>
              <p class="muted">No staff assessment yet.</p>
            <% } else { 
                 let tObj = {};
                 try { tObj = JSON.parse(latestStaffRow.skills_json || '{}') } catch(e) {}
            %>
              <p class="muted">
                <span class="pill"><%= latestStaffRow.term || '—' %></span>
                <span style="margin-left:8px;"><%= new Date(latestStaffRow.created_at).toLocaleString() %></span>
              </p>
              <table class="vspace-s">
                <thead><tr><th>Skill</th><th>Score</th></tr></thead>
                <tbody>
                  <% (skills||[]).forEach(function(s){ %>
                    <tr><td><%= s.name %></td><td><%= tObj[s.key] ?? '—' %></td></tr>
                  <% }) %>
                </tbody>
              </table>
            <% } %>
          </div>
        </div>
      </div>
    </div>

    <div class="vspace"></div>

    <!-- Training resources -->
    <div class="card">
      <h2 style="margin-top:0">Training resources</h2>

      <form method="post" action="/staff/student/<%= student.id %>/resource" enctype="multipart/form-data" class="grid-3">
        <div>
          <label>Title</label>
          <input type="text" name="title" required placeholder="e.g. Food Hygiene PPT Week 1">
        </div>
        <div>
          <label>Link (optional)</label>
          <input type="url" name="url" placeholder="https://example.com/training">
        </div>
        <div>
          <label>Upload file (optional)</label>
          <input type="file" name="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip">
        </div>
        <div style="grid-column: 1 / -1;">
          <button class="btn" type="submit">Add resource</button>
        </div>
      </form>

      <% const resList = (typeof resources !== 'undefined' && resources) ? resources : []; %>
      <% if (!resList.length) { %>
        <p class="muted vspace-s">No resources yet.</p>
      <% } else { %>
        <table class="vspace-s">
          <thead>
            <tr>
              <th style="width:40%;">Title</th>
              <th style="width:30%;">Link</th>
              <th style="width:20%;">File</th>
              <th style="width:10%;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <% resList.forEach(function(r){ %>
              <tr>
                <td><%= r.title %></td>
                <td>
                  <% if (r.url) { %><a href="<%= r.url %>" target="_blank" rel="noopener">Open link</a><% } else { %><span class="muted">—</span><% } %>
                </td>
                <td>
                  <% if (r.file_path) { %><a href="<%= r.file_path %>" target="_blank" rel="noopener">Download file</a><% } else { %><span class="muted">—</span><% } %>
                </td>
                <td>
                  <form method="post" action="/staff/student/<%= student.id %>/resource/<%= r.id %>/delete" onsubmit="return confirm('Delete this resource?')" style="display:inline;">
                    <button class="btn outline" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      <% } %>
    </div>

    <div class="vspace"></div>

    <!-- Self-assessment history -->
    <div class="card">
      <h2 style="margin-top:0">Self-assessments</h2>
      <% if (!selfRows || !selfRows.length) { %>
        <p class="muted">No self-assessments yet.</p>
      <% } else { %>
        <table>
          <thead>
            <tr>
              <th style="width:18%;">Date</th>
              <th style="width:18%;">Term</th>
              <th>Top scores</th>
            </tr>
          </thead>
          <tbody>
            <% selfRows.forEach(function(h){
                 let obj = {};
                 try { obj = JSON.parse(h.skills_json || '{}'); } catch(e) {}
                 const top3 = (Object.entries(obj).map(([k,v])=>({k,v}))
                   .sort((a,b)=>(b.v||0)-(a.v||0)).slice(0,3));
            %>
              <tr>
                <td><%= new Date(h.created_at).toLocaleString() %></td>
                <td><span class="pill"><%= h.term || '—' %></span></td>
                <td class="muted">
                  <% if (!top3.length) { %>—<% } else { %>
                    <% top3.forEach(function(s,idx){
                         const sk = (skills||[]).find(x=>x.key===s.k);
                    %>
                      <%= (sk && sk.name) ? sk.name : s.k %> = <strong><%= s.v %></strong><%= idx<top3.length-1 ? ', ' : '' %>
                    <% }) %>
                  <% } %>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      <% } %>
    </div>

    <div class="vspace"></div>

    <!-- Practical job skills -->
    <div class="card">
      <h2 style="margin-top:0">Practical job skills</h2>
      <% const pRows = (typeof practicalRows !== 'undefined' && Array.isArray(practicalRows)) ? practicalRows : [];
         const pSkills = (typeof practicalSkills !== 'undefined' && Array.isArray(practicalSkills)) ? practicalSkills : [];
         const pLatest = pRows[0] || null;
         const pCategories = [...new Set(pSkills.map(s => s.category))];
         const pAverage = (obj, items) => { const vals=items.map(i=>Number(obj[i.key])).filter(v=>v>=1&&v<=4); return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0; };
         let pObj={}; try{ if(pLatest) pObj=JSON.parse(pLatest.skills_json||'{}'); }catch(e){};
         const pLabel = v => Number(v)>=4?'On my own':Number(v)>=3?'With some help':Number(v)>=2?'With lots of help':'Not yet';
      %>
      <% if (!pLatest) { %>
        <p class="muted">This learner has not completed the practical job skills questionnaire yet.</p>
      <% } else { const overall=pAverage(pObj,pSkills); const overallPc=Math.round(((overall-1)/3)*100); %>
        <p class="muted"><span class="pill"><%= pLatest.term || '—' %></span><span style="margin-left:8px;"><%= new Date(pLatest.created_at).toLocaleDateString('en-GB') %></span></p>
        <div class="practical-summary">
          <div class="practical-score"><strong><%= overallPc %>%</strong><span style="font-weight:700; margin-top:6px;">independence snapshot</span></div>
          <div class="practical-cats">
            <% pCategories.forEach(function(cat){ const items=pSkills.filter(s=>s.category===cat); const pc=Math.round(((pAverage(pObj,items)-1)/3)*100); %>
              <div class="practical-cat"><div style="display:flex;justify-content:space-between;gap:8px;"><strong><%= cat %></strong><span><%= pc %>%</span></div><div class="practical-track"><div class="practical-fill" style="width:<%= pc %>%"></div></div></div>
            <% }) %>
          </div>
        </div>
        <% if (pLatest.target) { %><div class="vspace"><strong>Learner's next skill:</strong> <span class="muted"><%= pLatest.target %></span></div><% } %>
        <table class="vspace">
          <thead><tr><th>Skill</th><th style="width:180px;">Learner response</th></tr></thead>
          <tbody>
            <% pSkills.forEach(function(sk){ const v=Number(pObj[sk.key]||0); %>
              <tr><td><strong><%= sk.name %></strong><div class="muted" style="font-size:.86rem; margin-top:2px;"><%= sk.help %></div></td><td><span class="support-badge support-<%= v || 1 %>"><%= pLabel(v) %></span></td></tr>
            <% }) %>
          </tbody>
        </table>
        <% if (pRows.length > 1) { %>
          <h3 class="vspace" style="margin-bottom:.4rem;">Previous practical assessments</h3>
          <table>
            <thead><tr><th>Date</th><th>Assessment point</th><th>Snapshot</th><th>Target</th></tr></thead>
            <tbody>
              <% pRows.slice(1).forEach(function(r){ let ro={}; try{ro=JSON.parse(r.skills_json||'{}')}catch(e){}; const pc=Math.round(((pAverage(ro,pSkills)-1)/3)*100); %>
                <tr><td><%= new Date(r.created_at).toLocaleDateString('en-GB') %></td><td><span class="pill"><%= r.term || '—' %></span></td><td><strong><%= pc %>%</strong></td><td class="muted"><%= r.target || '—' %></td></tr>
              <% }) %>
            </tbody>
          </table>
        <% } %>
      <% } %>
    </div>

    <div class="vspace"></div>

    <!-- Job applications -->
    <div class="card">
      <h2 style="margin-top:0">Applications</h2>
      <% if (!apps || !apps.length) { %>
        <p class="muted">No job applications yet.</p>
      <% } else { %>
        <table>
          <thead>
            <tr>
              <th style="width:18%;">Date</th>
              <th style="width:25%;">Employer</th>
              <th style="width:25%;">Role</th>
              <th style="width:16%;">Status</th>
              <th style="width:16%;">CV</th>
            </tr>
          </thead>
          <tbody>
            <% apps.forEach(function(a){ %>
              <tr>
                <td><%= new Date(a.created_at).toLocaleString() %></td>
                <td><%= a.employer || '—' %></td>
                <td><%= (a.advert_title || a.job_role || '—') %></td>
                <td><span class="pill"><%= a.status || '—' %></span></td>
                <td>
                  <% if (a.cv_path) { %><a href="<%= a.cv_path %>" target="_blank">download</a><% } else { %><span class="muted">—</span><% } %>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      <% } %>
    </div>

    <div class="vspace-l"></div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
(function(){
  const labels = <%- JSON.stringify(labels) %>;
  const stu = <%- JSON.stringify(stuScores) %>;
  const staff = <%- JSON.stringify(staffScores) %>;

  const hasStudent = Array.isArray(stu) && stu.some(v => v !== null && v !== undefined && v !== '');
  const hasStaff   = Array.isArray(staff) && staff.some(v => v !== null && v !== undefined && v !== '');
  const ctx = document.getElementById('saRadar');
  if (!ctx || (!hasStudent && !hasStaff)) return;

  const studentColor = 'rgba(37, 99, 235, 0.6)';
  const studentBorder = 'rgba(37, 99, 235, 1)';
  const staffColor   = 'rgba(16, 185, 129, 0.45)';
  const staffBorder  = 'rgba(16, 185, 129, 1)';

  const fix = arr => arr.map(v => (v == null ? 0 : Number(v)));

  const datasets = [];
  if (hasStudent) datasets.push({ label:'Student', data:fix(stu), backgroundColor:studentColor, borderColor:studentBorder, borderWidth:2, pointBackgroundColor:studentBorder, pointBorderColor:'#fff', pointRadius:3 });
  if (hasStaff)   datasets.push({ label:'Staff',   data:fix(staff), backgroundColor:staffColor,  borderColor:staffBorder,  borderWidth:2, pointBackgroundColor:staffBorder,  pointBorderColor:'#fff', pointRadius:3 });

  new Chart(ctx, {
    type: 'radar',
    data: { labels, datasets },
    options: {
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{ position:'top' } },
      elements:{ line:{ tension:0.2 } },
      scales:{
        r:{
          suggestedMin:0, suggestedMax:5,
          ticks:{ stepSize:1, backdropColor:'transparent' },
          grid:{ color:'rgba(0,0,0,0.08)' },
          angleLines:{ color:'rgba(0,0,0,0.08)' },
          pointLabels:{ font:{ size:12 } }
        }
      }
    }
  });
})();
</script>

<%- include('../partials/footer.js') %>
