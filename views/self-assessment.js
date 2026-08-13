<%
  const title  = 'My Progress';
  const active = 'self';

  const cycleTerms = ['Autumn', 'Spring', 'Summer'];
  const historyCount = Array.isArray(history) ? history.length : 0;
  const nextTerm = cycleTerms[historyCount % cycleTerms.length];
  const showNewForm = (!latest) || String((typeof newForm !== 'undefined' ? newForm : '')) === '1';

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
