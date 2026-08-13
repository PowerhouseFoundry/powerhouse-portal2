<% const title = 'Staff Dashboard'; const active = 'dashboard'; %>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="staff-dash">
  <style>
    #staff-dash .wrap { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    #staff-dash h1 { margin: .25rem 0 1rem 0; }
    #staff-dash .bar { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
    #staff-dash .label { font-weight:600; color:#374151; }
    #staff-dash select { padding:8px 10px; border-radius:10px; border:1px solid #d1d5db; }

    #staff-dash .grid { display:grid; gap:12px; }
    #staff-dash .two { grid-template-columns: 1fr 1fr; }
    @media (max-width: 1024px){ #staff-dash .two { grid-template-columns: 1fr; } }

    #staff-dash .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
    #staff-dash ul { padding-left:18px; margin: .25rem 0; }
    #staff-dash .muted { color:#6b7280; }

    #staff-dash table { width:100%; border-collapse: collapse; }
    #staff-dash th, #staff-dash td { text-align:left; padding:8px 10px; border-bottom:1px solid #f0f0f0; }
    #staff-dash th { font-weight:600; color:#374151; }
    #staff-dash .actions { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
    #staff-dash .actions form { display:inline; }
    #staff-dash .btn { padding:8px 12px; border-radius:10px; border:1px solid #d1d5db; background:#fff; cursor:pointer; text-decoration:none; display:inline-block; }
    #staff-dash .btn:hover { border-color:#10b981; color:#10b981; }

    /* Small admin-only learner delete control */
    #staff-dash .learner-name-cell { display:flex; align-items:center; gap:7px; }
    #staff-dash .learner-delete-form { display:inline-flex; margin:0; }
    #staff-dash .learner-delete {
      width:20px; height:20px; padding:0; border:0; border-radius:999px;
      background:transparent; color:#dc2626; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center;
      font-size:19px; line-height:1; font-weight:700;
    }
    #staff-dash .learner-delete:hover,
    #staff-dash .learner-delete:focus-visible { background:#fee2e2; color:#b91c1c; outline:none; }
  </style>

  <div class="wrap">
    <h1>Staff Dashboard</h1>

    <form class="bar" method="get" action="/staff/dashboard">
      <span class="label">Class</span>
      <select name="class_id" onchange="this.form.submit()">
        <% (classes || []).forEach(c => { %>
          <option value="<%= c.id %>" <%= (classId === c.id) ? 'selected' : '' %>><%= c.name %></option>
        <% }) %>
      </select>
    </form>

    <div class="grid two" style="margin-top:.75rem">
      <!-- Students in class -->
      <div class="card">
        <h2>Students</h2>
        <% if (!students || !students.length) { %>
          <p class="muted">No students in this class yet.</p>
        <% } else { %>
          <table>
            <thead><tr><th>Name</th><th>Username</th></tr></thead>
            <tbody>
              <% students.forEach(s => { %>
                <tr>
                  <td>
                    <div class="learner-name-cell">
                      <a href="/staff/student/<%= s.id %>"><%= s.full_name %></a>
                      <% if (staff && staff.is_admin) { %>
                        <form class="learner-delete-form" method="post" action="/staff/admin/student/<%= s.id %>/delete"
                              onsubmit="return confirm('Delete this learner? This permanently removes their saved portal data and cannot be undone.')">
                          <input type="hidden" name="return_to" value="/staff/dashboard?class_id=<%= classId %>">
                          <button class="learner-delete" type="submit" title="Delete <%= s.full_name %>" aria-label="Delete <%= s.full_name %>">&times;</button>
                        </form>
                      <% } %>
                    </div>
                  </td>
                  <td><%= s.username %></td>
                </tr>
              <% }) %>
            </tbody>
          </table>
        <% } %>
      </div>

      <!-- Recent applications -->
      <div class="card">
        <h2>Recent applications</h2>
        <% if (!recentApps || !recentApps.length) { %>
          <p class="muted">No applications yet.</p>
        <% } else { %>
          <table>
            <thead>
              <tr><th>Student</th><th>Role</th><th>Status</th><th>Applied</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <% recentApps.forEach(a => { %>
                <tr>
                  <td><a href="/staff/student/<%= a.student_id %>"><%= a.full_name %></a></td>
                  <td><%= a.role %></td>
                  <td><%= a.status %></td>
                  <td><%= a.created_at %></td>
                  <td class="actions">
                    <!-- NEW: View link to the application page -->
                    <a class="btn" href="/staff/applications/<%= a.id %>">View</a>

                    <!-- Update status -->
                    <form method="post" action="/staff/applications/<%= a.id %>/status">
                      <select name="status" onchange="this.form.submit()">
                        <option <%= a.status==='Submitted'?'selected':'' %>>Submitted</option>
                        <option <%= a.status==='In Review'?'selected':'' %>>In Review</option>
                        <option <%= a.status==='Accepted'?'selected':'' %>>Accepted</option>
                        <option <%= a.status==='Declined'?'selected':'' %>>Declined</option>
                      </select>
                    </form>

                    <!-- Delete -->
                    <form method="post" action="/staff/applications/<%= a.id %>/delete" onsubmit="return confirm('Delete this application?')">
                      <button class="btn" type="submit">Delete</button>
                    </form>
                  </td>
                </tr>
              <% }) %>
            </tbody>
          </table>
        <% } %>
      </div>
    </div>

    <!-- Latest self-assessments -->
    <div class="card" style="margin-top:1rem">
      <h2>Latest self-assessments</h2>
      <% if (!latestSelf || !latestSelf.length) { %>
        <p class="muted">No self-assessments submitted yet.</p>
      <% } else { %>
        <ul>
          <% latestSelf.forEach(sa => {
               let obj = {};
               try { obj = JSON.parse(sa.skills_json || '{}'); } catch(e){}
               const nm = (userNames && userNames[sa.user_id]) ? userNames[sa.user_id] : (sa.full_name || ('Student #' + sa.user_id));
          %>
            <li>
              <a href="/staff/student/<%= sa.user_id %>"><%= nm %></a>
              — <em><%= sa.term || 'Term' %></em> • <%= sa.created_at %>
            </li>
          <% }) %>
        </ul>
      <% } %>
    </div>
  </div>
</div>

<%- include('../partials/footer.js') %>
