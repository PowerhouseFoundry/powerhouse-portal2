<% const title = 'Student Profile'; const active = 'staff-dashboard'; %>
<%- include('../partials/header.js', { title, active, staff }) %>

<div class="container">
  <h1><%= student.full_name %></h1>

  <!-- Quick meta -->
  <div class="muted" style="margin-bottom:1rem">
    Username: <strong><%= student.username %></strong>
  </div>

  <div class="grid two" style="gap:1rem">
    <!-- Assess student -->
    <div class="card">
      <h2>Staff assessment</h2>
      <form method="post" action="/staff/student/<%= student.id %>/assess">
        <label>
          <span class="label">Term</span>
          <select name="term">
            <% (terms || []).forEach(t => { %>
              <option value="<%= t %>"><%= t %></option>
            <% }) %>
          </select>
        </label>

        <div class="skills-list" style="margin-top:.5rem">
          <% (skills || []).forEach(s => { %>
            <div class="skill-row">
              <div class="skill-name"><%= s.name %></div>
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

        <div style="margin-top:1rem">
          <button class="btn" type="submit">Save staff assessment</button>
        </div>
      </form>
    </div>

    <!-- Staff comment -->
    <div class="card">
      <h2>Staff comment</h2>
      <form method="post" action="/staff/student/<%= student.id %>/comment">
        <div class="grid two">
          <label>
            <span class="label">Term</span>
            <select name="term">
              <% (terms || []).forEach(t => { %>
                <option value="<%= t %>"><%= t %></option>
              <% }) %>
            </select>
          </label>
        </div>
<label style="margin-top:.5rem; display:block">
  <span class="label">Comment</span>
  <textarea 
    name="comment" 
    style="width:100%; height:120px; resize:none; margin-top:.25rem"
    placeholder="Constructive summary of progress and next steps"></textarea>
</label>

        <div style="margin-top:1rem">
          <button class="btn" type="submit">Add comment</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Training resources: upload + list -->
  <div class="card" style="margin-top:1rem">
    <h2>Training resources</h2>

    <!-- Upload form -->
    <form method="post" action="/staff/student/<%= student.id %>/resource" enctype="multipart/form-data" class="grid three" style="gap:1rem">
      <label>
        <span class="label">Title</span>
        <input type="text" name="title" required placeholder="e.g. Food Hygiene PPT Week 1">
      </label>
      <label>
        <span class="label">Link (optional)</span>
        <input type="url" name="url" placeholder="https://example.com/training">
      </label>
      <label>
        <span class="label">Upload file (optional)</span>
        <input type="file" name="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip">
      </label>
      <div style="grid-column: 1 / -1">
        <button class="btn" type="submit">Add resource</button>
      </div>
    </form>

    <!-- Existing resources -->
    <% const resList = (typeof resources !== 'undefined' && resources) ? resources : []; %>
    <% if (!resList.length) { %>
      <p class="muted" style="margin-top:.75rem">No resources yet.</p>
    <% } else { %>
      <ul style="margin-top:.75rem">
        <% resList.forEach(r => { %>
          <li style="margin-bottom:.5rem">
            <strong><%= r.title %></strong>
            <% if (r.url) { %>
              — <a href="<%= r.url %>" target="_blank" rel="noopener">Open link</a>
            <% } %>
            <% if (r.file_path) { %>
              — <a href="<%= r.file_path %>" target="_blank" rel="noopener">Download file</a>
            <% } %>
            <span class="muted"> • <%= r.created_at %></span>
            <form method="post" action="/staff/student/<%= student.id %>/resource/<%= r.id %>/delete" style="display:inline" onsubmit="return confirm('Delete this resource?');">
              <button class="btn outline small" type="submit">Delete</button>
            </form>
          </li>
        <% }) %>
      </ul>
    <% } %>
  </div>

  <!-- Self-assessments -->
  <div class="card" style="margin-top:1rem">
    <h2>Self-assessments</h2>
    <% if (!selfRows || !selfRows.length) { %>
      <p class="muted">No self-assessments yet.</p>
    <% } else { %>
      <ul>
        <% selfRows.forEach(h => { 
             let obj = {};
             try { obj = JSON.parse(h.skills_json || '{}'); } catch(e) {}
        %>
          <li style="margin-bottom:.5rem">
            <strong><%= h.term || 'Term' %></strong>
            <span class="muted"> — <%= h.created_at %></span>
            <div class="small muted">
              Timekeeping: <%= obj.timekeeping || 0 %>,
              Teamwork: <%= obj.teamwork || 0 %>,
              Communication: <%= obj.communication || 0 %>,
              Problem Solving: <%= obj.problem_solving || 0 %>,
              Following Instructions: <%= obj.following_instructions || 0 %>,
              Customer Service: <%= obj.customer_service || 0 %>
            </div>
            <% if ((h.reflection||'').trim() || (h.target||'').trim()) { %>
              <details style="margin-top:.25rem">
                <summary>Reflection & target</summary>
                <div class="small" style="margin-top:.25rem">
                  <div><strong>Reflection:</strong> <%= (h.reflection||'').trim() || '—' %></div>
                  <div><strong>Target:</strong> <%= (h.target||'').trim() || '—' %></div>
                </div>
              </details>
            <% } %>
          </li>
        <% }) %>
      </ul>
    <% } %>
  </div>

  <!-- Applications -->
  <div class="card" style="margin-top:1rem">
    <h2>Applications</h2>
    <% if (!apps || !apps.length) { %>
      <p class="muted">No job applications yet.</p>
    <% } else { %>
      <ul>
        <% apps.forEach(a => { %>
          <li style="margin-bottom:.5rem">
            <strong><%= a.job_role || a.advert_title || 'Application' %></strong>
            <span class="muted"> — <%= a.created_at %> • Status: <%= a.status %></span>
            <a class="btn outline small" href="/staff/applications/<%= a.app_id || a.id %>" style="margin-left:.5rem">View</a>
          </li>
        <% }) %>
      </ul>
    <% } %>
  </div>
</div>

<style>
  .skills-list { display:flex; flex-direction:column; gap:.5rem; }
  .skill-row { display:grid; grid-template-columns: 1fr 280px; align-items:center; gap:.75rem; }
  .skill-name { font-weight:600; }
  .scale-inputs { display:grid; grid-template-columns: repeat(5, 1fr); gap:.5rem; }
  .scale-cell { display:flex; align-items:center; justify-content:center; }
  .scale-cell input[type="radio"] { position:absolute; opacity:0; width:0; height:0; }
  .scale-cell .dot { width:16px; height:16px; border-radius:50%; border:2px solid #93c5fd; display:inline-block; }
  .scale-cell input[type="radio"]:checked + .dot { background:#10b981; border-color:#10b981; }
  .btn.small { padding:.25rem .5rem; font-size:.85rem; }
</style>

<%- include('../partials/footer.js') %>
