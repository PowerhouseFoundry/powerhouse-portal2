<% const title = 'Manage Applications'; const active = 'applications'; %>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="staff-applications">
  <style>
    #staff-applications * { box-sizing:border-box; }
    #staff-applications .wrap { max-width:1250px; margin:0 auto; padding:0 16px; }
    #staff-applications h1 { margin:.25rem 0 .35rem; }
    #staff-applications .muted { color:#6b7280; }
    #staff-applications .card { background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px; }
    #staff-applications .toolbar { display:flex;gap:10px;align-items:end;flex-wrap:wrap;margin:14px 0; }
    #staff-applications .field { display:grid;gap:5px;min-width:190px; }
    #staff-applications .field label { font-weight:700;color:#374151;font-size:.9rem; }
    #staff-applications select { border:1px solid #d1d5db;border-radius:10px;padding:9px 10px;background:#fff; }
    #staff-applications .btn { padding:9px 12px;border-radius:10px;border:1px solid #6d28d9;background:#6d28d9;color:#fff;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;font-weight:700; }
    #staff-applications .btn:hover { background:#5b21b6;border-color:#5b21b6; }
    #staff-applications .btn.outline { background:#fff;color:#5b21b6; }
    #staff-applications .btn.danger { background:#b91c1c;border-color:#b91c1c; }
    #staff-applications .btn.danger:hover { background:#991b1b;border-color:#991b1b; }
    #staff-applications .btn:disabled { opacity:.45;cursor:not-allowed; }
    #staff-applications .table-wrap { overflow-x:auto; }
    #staff-applications table { width:100%;border-collapse:collapse;min-width:860px; }
    #staff-applications th,#staff-applications td { text-align:left;padding:10px;border-bottom:1px solid #eef0f3;vertical-align:middle; }
    #staff-applications th { color:#374151;font-size:.9rem; }
    #staff-applications .select-col { width:42px;text-align:center; }
    #staff-applications input[type="checkbox"] { width:20px;height:20px;accent-color:#6d28d9;cursor:pointer; }
    #staff-applications .status { display:inline-block;border-radius:999px;padding:4px 8px;background:#f3f4f6;font-size:.85rem;font-weight:700; }
    #staff-applications .actions { display:flex;gap:7px;align-items:center;flex-wrap:wrap; }
    #staff-applications .actions .btn { padding:7px 9px;font-size:.9rem; }
    #staff-applications .bulk-bar { display:flex;gap:10px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:10px;padding:10px 12px;border-radius:12px;background:#f8fafc;border:1px solid #e5e7eb; }
    #staff-applications .bulk-left { display:flex;gap:9px;align-items:center;flex-wrap:wrap; }
    #staff-applications .notice { padding:10px 12px;border-radius:10px;margin:10px 0; }
    #staff-applications .success { background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46; }
    #staff-applications .error { background:#fff1f2;border:1px solid #fecdd3;color:#9f1239; }
    #staff-applications .danger-zone { margin-top:16px;border:1px solid #fecaca;background:#fffafa; }
    #staff-applications .danger-zone h2 { margin-top:0;color:#991b1b; }
    #staff-applications .confirm-row { display:flex;gap:8px;align-items:end;flex-wrap:wrap; }
    #staff-applications .confirm-row input { border:1px solid #d1d5db;border-radius:10px;padding:9px 10px;min-width:260px; }
    @media(max-width:700px){ #staff-applications .field{min-width:100%;} #staff-applications .toolbar .btn{width:100%;} }
  </style>

  <div class="wrap">
    <h1>Manage job applications</h1>
    <p class="muted">Review applications, select several at once, or remove old practice applications between assessment cycles.</p>

    <% if (deleted) { %><div class="notice success"><strong><%= deleted %></strong> application<%= String(deleted)==='1' ? '' : 's' %> deleted.</div><% } %>
    <% if (error === 'select') { %><div class="notice error">Select at least one application first.</div><% } %>
    <% if (error === 'admin') { %><div class="notice error">Only an admin staff account can delete every application at once.</div><% } %>
    <% if (error === 'confirmation') { %><div class="notice error">The confirmation text did not match. No applications were deleted.</div><% } %>

    <div class="card">
      <form class="toolbar" method="get" action="/staff/applications">
        <div class="field">
          <label for="class_id">Class</label>
          <select id="class_id" name="class_id">
            <option value="">All classes</option>
            <% (classes || []).forEach(c => { %>
              <option value="<%= c.id %>" <%= classId === c.id ? 'selected' : '' %>><%= c.name %></option>
            <% }) %>
          </select>
        </div>
        <div class="field">
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="">All statuses</option>
            <% ['Submitted','In Review','Accepted','Declined'].forEach(s => { %>
              <option value="<%= s %>" <%= status === s ? 'selected' : '' %>><%= s %></option>
            <% }) %>
          </select>
        </div>
        <button class="btn" type="submit">Apply filters</button>
        <a class="btn outline" href="/staff/applications">Clear filters</a>
      </form>

      <% if (!applications || !applications.length) { %>
        <p class="muted">No job applications match this view.</p>
      <% } else { %>
        <form id="bulk-delete-form" method="post" action="/staff/applications/bulk-delete" onsubmit="return confirmBulkDelete()">
          <div class="bulk-bar">
            <div class="bulk-left">
              <label style="display:inline-flex;gap:7px;align-items:center;font-weight:700">
                <input id="select-all" type="checkbox" aria-label="Select all applications shown">
                Select all shown
              </label>
              <span id="selected-count" class="muted">0 selected</span>
            </div>
            <button id="delete-selected" class="btn danger" type="submit" disabled>Delete selected</button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="select-col"></th>
                  <th>Learner</th>
                  <th>Role</th>
                  <th>Employer</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <% applications.forEach(a => { %>
                  <tr>
                    <td class="select-col"><input class="row-select" type="checkbox" name="application_ids" value="<%= a.id %>" aria-label="Select application from <%= a.student_name %> for <%= a.advert_title || a.role || 'job' %>"></td>
                    <td><a href="/staff/student/<%= a.user_id %>"><strong><%= a.student_name %></strong></a><br><span class="muted">@<%= a.student_username %></span></td>
                    <td><%= a.advert_title || a.role || '—' %></td>
                    <td><%= a.employer || '—' %></td>
                    <td><span class="status"><%= a.status %></span></td>
                    <td><%= a.created_at %></td>
                    <td class="actions">
                      <a class="btn outline" href="/staff/applications/<%= a.id %>">View</a>
                    </td>
                  </tr>
                <% }) %>
              </tbody>
            </table>
          </div>
        </form>
      <% } %>
    </div>

    <% if (staff && staff.is_admin) { %>
      <div class="card danger-zone">
        <h2>Delete all applications</h2>
        <p class="muted">This permanently deletes all <strong><%= totalCount || 0 %></strong> saved job applications, including applications hidden by the filters above. Learner accounts and job adverts are not deleted.</p>
        <form method="post" action="/staff/applications/delete-all" onsubmit="return confirm('Delete ALL saved job applications? This cannot be undone.')">
          <div class="confirm-row">
            <div class="field">
              <label for="delete-all-confirmation">Type <strong>DELETE ALL APPLICATIONS</strong> to confirm</label>
              <input id="delete-all-confirmation" type="text" name="confirmation" autocomplete="off" required placeholder="DELETE ALL APPLICATIONS">
            </div>
            <button class="btn danger" type="submit" <%= totalCount ? '' : 'disabled' %>>Delete all applications</button>
          </div>
        </form>
      </div>
    <% } %>
  </div>
</div>

<script>
(function(){
  const all = document.getElementById('select-all');
  const rows = Array.from(document.querySelectorAll('.row-select'));
  const count = document.getElementById('selected-count');
  const button = document.getElementById('delete-selected');
  if (!rows.length || !count || !button) return;

  function update(){
    const selected = rows.filter(cb => cb.checked).length;
    count.textContent = selected + ' selected';
    button.disabled = selected === 0;
    if (all) {
      all.checked = selected === rows.length;
      all.indeterminate = selected > 0 && selected < rows.length;
    }
  }
  if (all) all.addEventListener('change', function(){ rows.forEach(cb => { cb.checked = all.checked; }); update(); });
  rows.forEach(cb => cb.addEventListener('change', update));
  update();

  window.confirmBulkDelete = function(){
    const selected = rows.filter(cb => cb.checked).length;
    if (!selected) return false;
    return confirm('Delete ' + selected + ' selected application' + (selected === 1 ? '' : 's') + '? This cannot be undone.');
  };
})();
</script>

<%- include('../partials/footer.js') %>
