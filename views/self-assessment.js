<%
  const title  = 'My Progress';
  const active = 'self';

  const cycleTerms = ['Autumn', 'Spring', 'Summer'];
  const historyCount = Array.isArray(history) ? history.length : 0;
  const nextTerm = cycleTerms[historyCount % cycleTerms.length];
  const showNewForm = (!latest) || String((typeof newForm !== 'undefined' ? newForm : '')) === '1';
  const activePanel = (typeof panel !== 'undefined' && panel === 'practical') ? 'practical' : 'workplace';
  const practicalItems = Array.isArray(practicalSkills) ? practicalSkills : [];
  const practicalRows = Array.isArray(practicalHistory) ? practicalHistory : [];
  const practicalNextTerm = cycleTerms[practicalRows.length % cycleTerms.length];
  const showPracticalForm = (!practicalLatest) || String((typeof newPractical !== 'undefined' ? newPractical : '')) === '1';
  const practicalCategories = [...new Set(practicalItems.map(s => s.category))];
  let practicalLatestScores = {};
  let practicalPreviousScores = {};
  try { practicalLatestScores = practicalLatest ? JSON.parse(practicalLatest.skills_json || '{}') : {}; } catch(e) {}
  try { practicalPreviousScores = practicalPrevious ? JSON.parse(practicalPrevious.skills_json || '{}') : {}; } catch(e) {}
  const practicalAverage = (scores, items) => {
    const vals = items.map(i => Number(scores[i.key])).filter(v => v >= 1 && v <= 4);
    return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : 0;
  };
  const practicalOverall = practicalAverage(practicalLatestScores, practicalItems);
  const practicalPreviousOverall = practicalAverage(practicalPreviousScores, practicalItems);
  const practicalPercent = practicalOverall ? Math.round(((practicalOverall - 1) / 3) * 100) : 0;
  const practicalStatus = v => {
    const n = Number(v);
    if (n >= 4) return { label:'On my own', cls:'level-4' };
    if (n >= 3) return { label:'With some help', cls:'level-3' };
    if (n >= 2) return { label:'With lots of help', cls:'level-2' };
    return { label:'Not yet', cls:'level-1' };
  };

  // Chart data prep
  const labels = (skills||[]).map(s => s.name);
  let stuScores = [];
  let staffScores = [];
  try {
    const s = latest ? JSON.parse(latest.skills_json || '{}') : {};
    stuScores = (skills||[]).map(k => s[k.key] ?? null);
  } catch(e){ stuScores = (skills||[]).map(() => null); }
  try {
    const t = staffLatest ? JSON.parse(staffLatest.skills_json || '{}') : {};
    staffScores = (skills||[]).map(k => t[k.key] ?? null);
  } catch(e){ staffScores = (skills||[]).map(() => null); }
%>
<%- include('partials/header.js', { title, active, user }) %>

<div id="self-assessment-page">
  <style>
    /* Layout & cards */
    #self-assessment-page .wrap { max-width: 1100px; margin: 0 auto; padding: 30px 16px 46px; }
    #self-assessment-page h1 { margin:0 0 .45rem 0; }
    #self-assessment-page .card {
      background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px;
    }
    #self-assessment-page .muted { color:#6b7280; }
    #self-assessment-page .kicker { font-size:.9rem; color:#6b7280; margin:0 0 .25rem 0; }

    /* Inputs & labels */
    #self-assessment-page label { display:block; font-weight:600; margin:.25rem 0 .35rem; }
    #self-assessment-page select,
    #self-assessment-page textarea,
    #self-assessment-page input[type="text"] {
      width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; box-sizing:border-box; display:block;
      font: inherit;
    }
    #self-assessment-page textarea { min-height:110px; resize:vertical; }

    /* Purple buttons */
    #self-assessment-page .btn {
      background:#6d28d9; color:#fff; border:1px solid #6d28d9;
      border-radius:10px; padding:10px 14px; font-weight:600; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
      transition: background .2s, border-color .2s; white-space:nowrap; text-decoration:none;
    }
    #self-assessment-page .btn:hover { background:#5b21b6; border-color:#5b21b6; }
    #self-assessment-page .btn-secondary {
      background:#fff; color:#6d28d9; border:1px solid #d8b4fe;
    }
    #self-assessment-page .btn-secondary:hover { background:#faf5ff; border-color:#c084fc; }

    /* Grid */
    #self-assessment-page .grid-2 { display:grid; grid-template-columns: 1fr 1.2fr; gap:12px; }
    @media (max-width: 950px){ #self-assessment-page .grid-2 { grid-template-columns: 1fr; } }

    /* Skill rows */
    #self-assessment-page .skill-row {
      display:grid; grid-template-columns: 1fr auto; gap:10px; align-items:center;
      padding:8px 10px; border:1px solid #e5e7eb; border-radius:10px; background:#fafafa;
    }
    #self-assessment-page .skill-name { font-weight:600; }
    #self-assessment-page .score-choices { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    #self-assessment-page .score-choices input { accent-color:#6d28d9; }

    /* Tables */
    #self-assessment-page table { width:100%; border-collapse: collapse; }
    #self-assessment-page th, #self-assessment-page td {
      text-align:left; padding:10px; border-bottom:1px solid #e5e7eb; vertical-align:top;
    }
    #self-assessment-page th { background:#f9fafb; font-weight:700; }
    #self-assessment-page .pill {
      display:inline-block; padding:2px 8px; border-radius:999px; background:#f3f4f6; font-size:.85rem;
    }
    #self-assessment-page .term-box {
      background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px; padding:10px 12px;
    }
    #self-assessment-page .actions-row {
      display:flex; gap:10px; align-items:center; flex-wrap:wrap;
    }

    /* Progress navigation */
    #self-assessment-page .progress-tabs { display:flex; gap:8px; margin:0 0 14px; padding:5px; background:#f3f4f6; border-radius:13px; width:max-content; max-width:100%; }
    #self-assessment-page .progress-tab { padding:10px 14px; border-radius:10px; text-decoration:none; color:#4b5563; font-weight:700; }
    #self-assessment-page .progress-tab.active { background:#fff; color:#6d28d9; box-shadow:0 1px 4px rgba(0,0,0,.08); }

    /* Practical job skills */
    #self-assessment-page .practical-hero { background:linear-gradient(135deg,#312e81,#6d28d9); color:#fff; border:0; padding:20px; }
    #self-assessment-page .practical-hero .muted { color:#ede9fe; }
    #self-assessment-page .snapshot-grid { display:grid; grid-template-columns: 220px 1fr; gap:16px; align-items:stretch; }
    #self-assessment-page .overall-score { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); border-radius:14px; padding:18px; }
    #self-assessment-page .overall-number { font-size:2.8rem; line-height:1; font-weight:800; }
    #self-assessment-page .category-cards { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
    #self-assessment-page .category-card { background:#fff; color:#111827; border-radius:12px; padding:12px; }
    #self-assessment-page .category-card .cat-name { font-weight:800; font-size:.95rem; }
    #self-assessment-page .mini-track, #self-assessment-page .skill-track { height:9px; background:#e5e7eb; border-radius:999px; overflow:hidden; margin-top:8px; }
    #self-assessment-page .mini-fill, #self-assessment-page .skill-fill { height:100%; border-radius:999px; background:#6d28d9; }
    #self-assessment-page .assessment-key { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin:12px 0; }
    #self-assessment-page .key-item { border-radius:10px; padding:9px 10px; font-weight:700; font-size:.88rem; text-align:center; border:1px solid transparent; }
    #self-assessment-page .level-1 { background:#fee2e2; color:#991b1b; border-color:#fecaca; }
    #self-assessment-page .level-2 { background:#ffedd5; color:#9a3412; border-color:#fed7aa; }
    #self-assessment-page .level-3 { background:#fef3c7; color:#92400e; border-color:#fde68a; }
    #self-assessment-page .level-4 { background:#dcfce7; color:#166534; border-color:#bbf7d0; }
    #self-assessment-page .practical-group { margin-top:14px; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden; }
    #self-assessment-page .practical-group h3 { margin:0; padding:12px 14px; background:#f9fafb; border-bottom:1px solid #e5e7eb; }
    #self-assessment-page .practical-question { padding:14px; border-bottom:1px solid #e5e7eb; }
    #self-assessment-page .practical-question:last-child { border-bottom:0; }
    #self-assessment-page .question-title { font-weight:800; font-size:1rem; }
    #self-assessment-page .question-help { color:#6b7280; margin-top:3px; font-size:.92rem; }
    #self-assessment-page .practical-options { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-top:10px; }
    #self-assessment-page .practical-option { margin:0; cursor:pointer; }
    #self-assessment-page .practical-option input { position:absolute; opacity:0; pointer-events:none; }
    #self-assessment-page .option-box { min-height:52px; display:flex; align-items:center; justify-content:center; text-align:center; border:2px solid #e5e7eb; border-radius:11px; padding:8px; background:#fff; font-weight:750; color:#374151; transition:.15s; }
    #self-assessment-page .practical-option input:checked + .option-box { border-color:#6d28d9; background:#f5f3ff; color:#5b21b6; box-shadow:0 0 0 2px rgba(109,40,217,.08); }
    #self-assessment-page .skill-result { display:grid; grid-template-columns:minmax(220px,1.5fr) minmax(180px,1fr) 150px; gap:12px; align-items:center; padding:11px 0; border-bottom:1px solid #f3f4f6; }
    #self-assessment-page .skill-result:last-child { border-bottom:0; }
    #self-assessment-page .status-badge { display:inline-block; text-align:center; padding:6px 9px; border-radius:999px; font-size:.82rem; font-weight:800; }
    #self-assessment-page .change-up { color:#047857; font-weight:800; }
    #self-assessment-page .change-down { color:#b91c1c; font-weight:800; }
    #self-assessment-page .history-summary { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
    #self-assessment-page .history-score { font-weight:800; font-size:1.05rem; }
    @media (max-width:760px){
      #self-assessment-page .snapshot-grid { grid-template-columns:1fr; }
      #self-assessment-page .category-cards { grid-template-columns:1fr; }
      #self-assessment-page .assessment-key, #self-assessment-page .practical-options { grid-template-columns:repeat(2,minmax(0,1fr)); }
      #self-assessment-page .skill-result { grid-template-columns:1fr; gap:6px; }
      #self-assessment-page .progress-tabs { width:100%; }
      #self-assessment-page .progress-tab { flex:1; text-align:center; }
    }

    /* Spacing */
    #self-assessment-page .vspace-s { margin-top:.5rem; }
    #self-assessment-page .vspace { margin-top:.75rem; }
    #self-assessment-page .vspace-l { margin-top:1rem; }

    /* Chart container */
    #self-assessment-page .chart-wrap { margin-top:.5rem; }
    #self-assessment-page .chart-card { padding:0; overflow:hidden; }
    #self-assessment-page .chart-header { padding:14px 14px 0 14px; }
    #self-assessment-page .chart-body { padding:0 14px 14px 14px; }
  </style>

  <div class="wrap">
    <span class="eyebrow">MY EMPLOYABILITY PATHWAY</span>
    <h1>My Progress</h1>
    <p class="muted" style="margin:0 0 1.25rem; max-width:760px;">Review your workplace skills, compare feedback and set your next target.</p>

    <div class="progress-tabs" role="navigation" aria-label="Progress assessments">
      <a class="progress-tab <%= activePanel === 'workplace' ? 'active' : '' %>" href="/self-assessment?panel=workplace">Workplace Skills</a>
      <a class="progress-tab <%= activePanel === 'practical' ? 'active' : '' %>" href="/self-assessment?panel=practical">Practical Job Skills</a>
    </div>

    <% if (activePanel === 'practical') { %>
      <% if (showPracticalForm) { %>
        <div class="card">
          <div class="actions-row" style="justify-content:space-between; align-items:flex-start;">
            <div>
              <div class="kicker">PRACTICAL JOB SKILLS</div>
              <h2 style="margin:.1rem 0 .35rem;">How much help do I need?</h2>
              <p class="muted" style="margin:0; max-width:760px;">Think about what you can do now. Choose the answer that is most like you. There are no wrong answers.</p>
            </div>
            <% if (practicalLatest) { %><a class="btn btn-secondary" href="/self-assessment?panel=practical">Cancel</a><% } %>
          </div>

          <div class="term-box vspace">
            <div style="font-weight:800;"><%= practicalNextTerm %> assessment</div>
            <div class="muted" style="margin-top:4px;">Complete this again at your next assessment point to see what has changed.</div>
          </div>

          <div class="assessment-key">
            <div class="key-item level-1">1 · Not yet</div>
            <div class="key-item level-2">2 · With lots of help</div>
            <div class="key-item level-3">3 · With some help</div>
            <div class="key-item level-4">4 · On my own</div>
          </div>

          <form method="post" action="/self-assessment/practical">
            <input type="hidden" name="term" value="<%= practicalNextTerm %>">
            <% practicalCategories.forEach(function(cat){ %>
              <section class="practical-group">
                <h3><%= cat %></h3>
                <% practicalItems.filter(s => s.category === cat).forEach(function(s){ %>
                  <div class="practical-question">
                    <div class="question-title">Can I <%= s.name.charAt(0).toLowerCase() + s.name.slice(1) %>?</div>
                    <div class="question-help"><%= s.help %></div>
                    <div class="practical-options" role="group" aria-label="<%= s.name %>">
                      <% (practicalScale || []).forEach(function(opt){ %>
                        <label class="practical-option">
                          <input type="radio" name="<%= s.key %>" value="<%= opt.value %>" required>
                          <span class="option-box"><%= opt.label %></span>
                        </label>
                      <% }) %>
                    </div>
                  </div>
                <% }) %>
              </section>
            <% }) %>

            <div class="vspace-l">
              <label>One skill I want to improve</label>
              <textarea name="target" placeholder="For example: I want to practise giving change."></textarea>
            </div>
            <div class="vspace actions-row">
              <button class="btn" type="submit">Save my practical skills assessment</button>
              <% if (practicalLatest) { %><a class="btn btn-secondary" href="/self-assessment?panel=practical">Keep current results</a><% } %>
            </div>
          </form>
        </div>
      <% } else { %>
        <div class="card practical-hero">
          <div class="actions-row" style="justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:.82rem; font-weight:800; letter-spacing:.08em; opacity:.85;">MY PRACTICAL JOB SKILLS</div>
              <h2 style="margin:.25rem 0 .35rem;"><%= practicalLatest.term || 'Latest' %> snapshot</h2>
              <p class="muted" style="margin:0 0 14px;">This shows how independently you feel you can use everyday job skills.</p>
            </div>
            <a class="btn" style="background:#fff; color:#5b21b6; border-color:#fff;" href="/self-assessment?panel=practical&newPractical=1">Start next assessment</a>
          </div>
          <div class="snapshot-grid">
            <div class="overall-score">
              <div class="overall-number"><%= practicalPercent %>%</div>
              <div style="font-weight:800; margin-top:7px;">independence snapshot</div>
              <div class="muted" style="font-size:.84rem; margin-top:4px;">Based on your 20 answers</div>
              <% if (practicalPrevious && practicalPreviousOverall) { const diff = practicalOverall-practicalPreviousOverall; %>
                <div style="margin-top:10px; font-weight:800;"><%= diff > 0.04 ? '↑' : diff < -0.04 ? '↓' : '→' %> <%= Math.abs(Math.round((diff/3)*100)) %> points from last time</div>
              <% } %>
            </div>
            <div class="category-cards">
              <% practicalCategories.forEach(function(cat){
                   const items = practicalItems.filter(s => s.category === cat);
                   const av = practicalAverage(practicalLatestScores, items);
                   const pc = Math.round(((av-1)/3)*100);
              %>
                <div class="category-card">
                  <div class="cat-name"><%= cat %></div>
                  <div style="display:flex; justify-content:space-between; gap:8px; margin-top:5px; font-size:.86rem; color:#6b7280;"><span><%= items.length %> skills</span><strong style="color:#111827"><%= pc %>%</strong></div>
                  <div class="mini-track"><div class="mini-fill" style="width:<%= pc %>%"></div></div>
                </div>
              <% }) %>
            </div>
          </div>
        </div>

        <% if (practicalLatest.target) { %>
          <div class="card vspace" style="border-left:4px solid #6d28d9;">
            <div class="kicker">MY NEXT SKILL</div>
            <div style="font-weight:800;"><%= practicalLatest.target %></div>
          </div>
        <% } %>

        <div class="card vspace">
          <div class="actions-row" style="justify-content:space-between;">
            <div>
              <h2 style="margin:0;">My 20 skills</h2>
              <p class="muted" style="margin:.3rem 0 0;">Green means you feel you can do the skill on your own. The other colours show where support or practice may help.</p>
            </div>
          </div>
          <div class="assessment-key">
            <div class="key-item level-1">Not yet</div><div class="key-item level-2">Lots of help</div><div class="key-item level-3">Some help</div><div class="key-item level-4">On my own</div>
          </div>
          <% practicalCategories.forEach(function(cat){ %>
            <div class="practical-group">
              <h3><%= cat %></h3>
              <div style="padding:0 14px;">
                <% practicalItems.filter(s => s.category === cat).forEach(function(s){
                     const val = Number(practicalLatestScores[s.key] || 0);
                     const stat = practicalStatus(val);
                     const previousVal = Number(practicalPreviousScores[s.key] || 0);
                     const change = previousVal ? val - previousVal : 0;
                %>
                  <div class="skill-result">
                    <div><div style="font-weight:800;"><%= s.name %></div><div class="muted" style="font-size:.86rem; margin-top:2px;"><%= s.help %></div></div>
                    <div><div class="skill-track"><div class="skill-fill" style="width:<%= Math.max(0,Math.min(100,(val/4)*100)) %>%"></div></div><% if (previousVal) { %><div style="font-size:.8rem; margin-top:4px;" class="<%= change>0?'change-up':change<0?'change-down':'muted' %>"><%= change>0?'Improved since last time':change<0?'Needs more support than last time':'Same as last time' %></div><% } %></div>
                    <div><span class="status-badge <%= stat.cls %>"><%= stat.label %></span></div>
                  </div>
                <% }) %>
              </div>
            </div>
          <% }) %>
        </div>

        <div class="card vspace">
          <h2 style="margin-top:0;">Practical skills history</h2>
          <% if (!practicalRows.length) { %><p class="muted">No previous assessments yet.</p><% } else { %>
            <table>
              <thead><tr><th>Date</th><th>Assessment point</th><th>Snapshot</th><th>Target</th><th>Actions</th></tr></thead>
              <tbody>
                <% practicalRows.forEach(function(h){ let obj={}; try{obj=JSON.parse(h.skills_json||'{}')}catch(e){}; const av=practicalAverage(obj,practicalItems); const pc=Math.round(((av-1)/3)*100); %>
                  <tr>
                    <td><%= new Date(h.created_at).toLocaleDateString('en-GB') %></td>
                    <td><span class="pill"><%= h.term || '—' %></span></td>
                    <td><div class="history-summary"><span class="history-score"><%= pc %>%</span><span class="muted">independence snapshot</span></div></td>
                    <td class="muted"><%= h.target || '—' %></td>
                    <td><% if (practicalLatest && Number(h.id)===Number(practicalLatest.id)) { %><span class="pill">Latest</span><% } %><form method="post" action="/self-assessment/practical/<%= h.id %>/delete" onsubmit="return confirm('Delete this practical skills assessment?')" style="display:inline-block; margin-left:6px;"><button class="btn btn-secondary" type="submit">Delete</button></form></td>
                  </tr>
                <% }) %>
              </tbody>
            </table>
          <% } %>
        </div>
      <% } %>
    <% } else { %>

    <div class="grid-2">

      <div class="card">
        <% if (showNewForm) { %>
          <div class="actions-row" style="justify-content:space-between; margin-bottom:.5rem;">
            <h2 style="margin:0">Your self-assessment</h2>
            <% if (latest) { %>
              <a class="btn btn-secondary" href="/self-assessment">Cancel</a>
            <% } %>
          </div>

          <form method="post" action="/self-assessment">
            <label>Term</label>
            <div class="term-box">
              <div style="font-weight:700;"><%= nextTerm %></div>
              <div class="muted" style="margin-top:4px;">The assessment cycle repeats Autumn, Spring, Summer.</div>
            </div>
            <select name="term" required style="display:none;">
              <option value="<%= nextTerm %>" selected><%= nextTerm %></option>
            </select>

            <div class="vspace"></div>
            <div class="kicker">Rate yourself from 1 (Needs Improvement) to 5 (Excellent)</div>
            <div class="vspace-s"></div>

            <div class="vspace">
              <% (skills||[]).forEach(function(s){ %>
                <div class="skill-row">
                  <div class="skill-name"><%= s.name %></div>
                  <div class="score-choices">
                    <% for (let i=1;i<=5;i++){ %>
                      <label style="display:flex; align-items:center; gap:6px; font-weight:600; margin:0;">
                        <input type="radio" name="<%= s.key %>" value="<%= i %>" required>
                        <span><%= i %></span>
                      </label>
                    <% } %>
                  </div>
                </div>
              <% }) %>
            </div>

            <div class="vspace">
              <label>Your reflection</label>
              <textarea name="reflection" placeholder="What went well? What could be improved?"></textarea>
            </div>

            <div class="vspace">
              <label>Your target</label>
              <textarea name="target" placeholder="What is one thing you will work on next?"></textarea>
            </div>

            <div class="vspace actions-row">
              <button class="btn" type="submit">Submit self-assessment</button>
              <% if (latest) { %>
                <a class="btn btn-secondary" href="/self-assessment">Keep current view</a>
              <% } %>
            </div>
          </form>
        <% } else { %>
          <div class="actions-row" style="justify-content:space-between; margin-bottom:.5rem;">
            <h2 style="margin:0">Reflections & comments</h2>
            <a class="btn" href="/self-assessment?newForm=1">Start new self-assessment</a>
          </div>

          <p class="muted">
            <span class="pill"><%= latest.term || '—' %></span>
            <span style="margin-left:8px;"><%= new Date(latest.created_at).toLocaleString() %></span>
          </p>

          <div class="term-box vspace-s">
            <div style="font-weight:700;">Next self-assessment: <%= nextTerm %></div>
            <div class="muted" style="margin-top:4px;">Your previous self-assessments stay in history so progress can be tracked over several years.</div>
          </div>

          <% if (latest.reflection) { %>
            <div class="vspace">
              <label>Your reflection</label>
              <div class="muted"><%= latest.reflection %></div>
            </div>
          <% } %>

          <% if (latest.target) { %>
            <div class="vspace">
              <label>Your target</label>
              <div class="muted"><%= latest.target %></div>
            </div>
          <% } %>

          <div class="vspace-l"></div>
          <h3 style="margin:0;">Staff comment</h3>
          <% if (!latestStaffComment) { %>
            <p class="muted">No staff comment yet.</p>
          <% } else { %>
            <p class="muted">
              <span class="pill"><%= latestStaffComment.term || '—' %></span>
              <span style="margin-left:8px;"><%= new Date(latestStaffComment.created_at).toLocaleString() %></span>
            </p>
            <div class="muted"><%= latestStaffComment.comment %></div>
          <% } %>
        <% } %>
      </div>

      <div class="card">
        <h2 style="margin-top:0">Scores overview</h2>

        <% if (!latest && !staffLatest) { %>
          <p class="muted">No scores to show yet.</p>
        <% } else { %>
          <div class="chart-wrap">
            <div class="card chart-card">
              <div class="chart-header">
                <h3 style="margin:0 0 .5rem 0; font-size:1.05rem;">Student vs Staff</h3>
              </div>
              <div class="chart-body">
                <canvas id="saRadar" aria-label="Radar chart of skills" role="img"></canvas>
              </div>
            </div>
          </div>

          <% if (latest) {
               let latestScores = {};
               try { latestScores = JSON.parse(latest.skills_json || '{}') } catch(e) {}
          %>
            <h3 class="vspace">Student scores</h3>
            <table class="vspace-s">
              <thead>
                <tr><th style="width:55%;">Skill</th><th>Score</th></tr>
              </thead>
              <tbody>
                <% (skills||[]).forEach(function(s){ %>
                  <tr>
                    <td><%= s.name %></td>
                    <td><%= latestScores[s.key] || '—' %></td>
                  </tr>
                <% }) %>
              </tbody>
            </table>
          <% } %>

          <% if (staffLatest) {
               let staffScoresObj = {};
               try { staffScoresObj = JSON.parse(staffLatest.skills_json || '{}') } catch(e) {}
          %>
            <h3 class="vspace">Staff scores</h3>
            <table class="vspace-s">
              <thead>
                <tr><th style="width:55%;">Skill</th><th>Score</th></tr>
              </thead>
              <tbody>
                <% (skills||[]).forEach(function(s){ %>
                  <tr>
                    <td><%= s.name %></td>
                    <td><%= staffScoresObj[s.key] || '—' %></td>
                  </tr>
                <% }) %>
              </tbody>
            </table>
          <% } %>
        <% } %>
      </div>
    </div>

    <div class="card vspace-l">
      <h2 style="margin-top:0">Your history</h2>
      <% if (!history || !history.length) { %>
        <p class="muted">No previous entries.</p>
      <% } else { %>
        <table class="vspace-s">
          <thead>
            <tr>
              <th style="width:140px;">Date</th>
              <th style="width:120px;">Term</th>
              <th>Highlights</th>
              <th style="width:130px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <% history.forEach(function(h){
                 let scores = {};
                 try { scores = JSON.parse(h.skills_json || '{}') } catch(e) {}
                 const top3 = Object.entries(scores)
                   .map(([k,v]) => ({ k, v }))
                   .sort((a,b) => (b.v||0) - (a.v||0))
                   .slice(0,3);
            %>
              <tr>
                <td><%= new Date(h.created_at).toLocaleString() %></td>
                <td><span class="pill"><%= h.term || '—' %></span></td>
                <td class="muted">
                  <% if (!top3.length) { %>—<% } else { %>
                    <% top3.forEach(function(s, idx){
                         const skill = (skills||[]).find(x => x.key === s.k);
                    %>
                      <%= (skill && skill.name) ? skill.name : s.k %> = <strong><%= s.v %></strong><%= idx < top3.length - 1 ? ', ' : '' %>
                    <% }) %>
                  <% } %>
                </td>
                <td>
                  <% if (latest && Number(h.id) === Number(latest.id)) { %>
                    <span class="pill">Latest</span>
                  <% } %>
                  <form method="post" action="/self-assessment/<%= h.id %>/delete" onsubmit="return confirm('Delete this self-assessment?')" style="display:inline-block; margin-left:6px;">
                    <button class="btn btn-secondary" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      <% } %>
    </div>

    <% } %>

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

<%- include('partials/footer.js') %>
