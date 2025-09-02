<%
  const title  = 'Admin Tools';
  const active = 'admin';
  const _classId = (typeof classId !== 'undefined' ? classId : null);
%>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="staff-admin">
  <style>
    #staff-admin .wrap { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    #staff-admin h1 { margin:.25rem 0 1rem 0; }
    #staff-admin .grid { display:grid; gap:12px; }
    #staff-admin .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
    #staff-admin .muted { color:#6b7280; }

    #staff-admin label { display:block; font-weight:600; margin:.25rem 0 .2rem; }
    #staff-admin input[type="text"],
    #staff-admin input[type="password"],
    #staff-admin input[type="email"],
    #staff-admin select,
    #staff-admin textarea {
      width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; box-sizing:border-box; display:block;
    }
    #staff-admin textarea { min-height:80px; }

    /* Purple action buttons */
    #staff-admin .btn {
      background:#6d28d9; color:#fff; border:1px solid #6d28d9;
      border-radius:10px; padding:8px 12px; font-weight:600; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
      transition: background .2s, border-color .2s; white-space:nowrap; text-decoration:none;
    }
    #staff-admin .btn:hover { background:#5b21b6; border-color:#5b21b6; }

    /* Delete icon (neutral) */
    #staff-admin .btn-icon { background:none; border:none; cursor:pointer; padding:6px; margin:0; }
    #staff-admin .btn-icon svg { width:16px; height:16px; fill:#374151; }
    #staff-admin .btn-icon:hover svg { fill:#111827; }

    /* Students table */
    #staff-admin table { width:100%; border-collapse:separate; border-spacing:0 8px; table-layout:fixed; }
    #staff-admin thead th {
      text-align:left; padding:0 12px 6px 12px; color:#374151; font-weight:600; font-size:.95rem;
    }
    #staff-admin tbody td {
      background:#fff; border:1px solid #e5e7eb; border-left:none; border-right:none;
      padding:10px 12px; vertical-align:middle;
    }
    #staff-admin tbody tr td:first-child { border-left:1px solid #e5e7eb; border-radius:12px 0 0 12px; }
    #staff-admin tbody tr td:last-child { border-right:1px solid #e5e7eb; border-radius:0 12px 12px 0; }

    #staff-admin .col-name     { width:28%; font-weight:700; color:#111827; }
    #staff-admin .col-username { width:22%; color:#374151; }
    #staff-admin .col-move     { width:22%; }
    #staff-admin .col-reset    { width:22%; }
    #staff-admin .col-delete   { width:6%; text-align:right; }

    #staff-admin .inline-form { display:flex; gap:8px; align-items:center; }
    #staff-admin .inline-form select { min-width:170px; }

    /* Layout helpers */
    #staff-admin .vspace { margin-top:.5rem; }
    #staff-admin .section-gap { margin-top:1rem; }
  </style>

  <div class="wrap">
    <h1>Admin Tools</h1>

    <div class="grid">

      <!-- ✅ NEW: Create Class -->
      <div class="card">
        <h2>Create class</h2>
        <form method="post" action="/staff/admin/classes" autocomplete="off">
          <label>Class name</label>
          <input type="text" name="name" required placeholder="e.g. Powerhouse Group B">
          <div class="vspace">
            <button class="btn" type="submit">Create</button>
          </div>
        </form>
      </div>

      <!-- Create Student -->
      <div class="card">
        <h2>Create student</h2>
        <form method="post" action="/staff/admin/create-student" autocomplete="off">
          <label>Full name</label>
          <input type="text" name="full_name" required>
          <label>Username</label>
          <input type="text" name="username" required>
          <label>Password</label>
          <input type="password" name="password" required>
          <label>Class</label>
          <select name="class_id">
            <option value="">(none)</option>
            <% (classes || []).forEach(function(c){ %>
              <option value="<%= c.id %>"><%= c.name %></option>
            <% }) %>
          </select>
          <div class="vspace">
            <button class="btn" type="submit">Create</button>
          </div>
        </form>
      </div>

      <!-- Classes & Students -->
      <div class="card">
        <h2>Classes & Students</h2>

        <!-- Filter by class -->
        <form method="get" action="/staff/admin" class="vspace" style="display:flex; gap:10px; align-items:center;">
          <label style="font-weight:600">Filter by class</label>
          <select name="class_id" onchange="this.form.submit()">
            <option value="" <%= (!_classId ? 'selected' : '') %>>All classes</option>
            <% (classes || []).forEach(function(c){ %>
              <option value="<%= c.id %>" <%= (_classId == c.id ? 'selected' : '') %>><%= c.name %></option>
            <% }) %>
          </select>
          <noscript><button class="btn" type="submit">Apply</button></noscript>
        </form>

        <table>
          <thead>
            <tr>
              <th class="col-name">Name</th>
              <th class="col-username">Username</th>
              <th class="col-move">Move class</th>
              <th class="col-reset">Reset password</th>
              <th class="col-delete"></th>
            </tr>
          </thead>
          <tbody>
            <% (students || []).forEach(function(s){ %>
              <tr>
                <td class="col-name"><%= s.full_name %></td>
                <td class="col-username">@<%= s.username %></td>

                <!-- Move class -->
                <td class="col-move">
                  <form method="post" action="/staff/admin/student/<%= s.id %>/move" class="inline-form">
                    <select name="class_id">
                      <% (classes || []).forEach(function(c){ %>
                        <option value="<%= c.id %>" <%= (s.class_id === c.id ? 'selected' : '') %>><%= c.name %></option>
                      <% }) %>
                    </select>
                    <button class="btn" type="submit">Move</button>
                  </form>
                </td>

                <!-- Reset password -->
                <td class="col-reset">
                  <form method="post" action="/staff/admin/student/<%= s.id %>/reset-password" class="inline-form">
                    <input type="password" name="password" placeholder="New password" required>
                    <button class="btn" type="submit">Reset</button>
                  </form>
                </td>

                <!-- Delete icon (far-right) -->
                <td class="col-delete">
                  <form method="post" action="/staff/admin/student/<%= s.id %>/delete"
                        onsubmit="return confirm('Delete this student? This cannot be undone.')">
                    <button class="btn-icon" type="submit" title="Delete student" aria-label="Delete student">
                      <!-- Trash bin SVG -->
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
                        <path d="M135.2 17.7C140.7 7.1 151.9 0 164.3 0H283.7c12.4 0 23.6 7.1 29.1 17.7L328 32h88c13.3 0 24 10.7 24 24s-10.7 24-24 24h-16l-21.2 339.4c-1.6 25.9-23.1 46.6-49 46.6H118.2c-25.9 0-47.4-20.7-49-46.6L48 80H32C18.7 80 8 69.3 8 56S18.7 32 32 32h88l15.2-14.3zM112 128l20.8 320h182.4L336 128H112z"/>
                      </svg>
                    </button>
                  </form>
                </td>
              </tr>
            <% }) %>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<%- include('../partials/footer.js') %>
