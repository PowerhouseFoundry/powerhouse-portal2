<%
  const title = 'Job Application';
  // Pick up an 'active' passed from res.render, otherwise default to 'jobs'
  const activeTab = (typeof locals !== 'undefined' && locals.active) ? locals.active : 'jobs';
%>
<%- include('../partials/header.js', { title, active: activeTab, staff }) %>

<div class="wrap" style="max-width:900px;margin:0 auto;padding:0 16px">
  <h1>Job Application</h1>

  <div class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px">
    <p><strong>Student:</strong> <%= app.student_name %> (@<%= app.student_username %>)</p>
    <p><strong>Advert:</strong> <%= app.advert_title || app.role || '—' %></p>
    <% if (app.advert_employer || app.employer) { %>
      <p><strong>Employer:</strong> <%= app.advert_employer || app.employer %></p>
    <% } %>
    <p><strong>Submitted:</strong> <%= app.created_at %></p>
    <p><strong>Status:</strong> <%= app.status %></p>

    <hr style="margin:12px 0">

    <h3>Application Notes</h3>
    <pre style="white-space:pre-wrap;font-family:inherit"><%= app.notes || '—' %></pre>

    <% if (app.cv_path) { %>
      <p style="margin-top:12px">
        <a class="btn" href="<%= app.cv_path %>" target="_blank" rel="noopener">Download CV</a>
      </p>
    <% } %>

    <form method="post" action="/staff/applications/<%= app.id %>/status" style="margin-top:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <input type="hidden" name="return_to" value="/staff/applications/<%= app.id %>">
      <label for="status"><strong>Update status:</strong></label>
      <select id="status" name="status">
        <option <%= app.status==='Submitted'?'selected':'' %>>Submitted</option>
        <option <%= app.status==='In Review'?'selected':'' %>>In Review</option>
        <option <%= app.status==='Accepted'?'selected':'' %>>Accepted</option>
        <option <%= app.status==='Declined'?'selected':'' %>>Declined</option>
      </select>
      <button class="btn" type="submit">Save</button>
    </form>

    <form method="post" action="/staff/applications/<%= app.id %>/delete"
          onsubmit="return confirm('Delete this application? This cannot be undone.')"
          style="margin-top:12px">
      <input type="hidden" name="return_to" value="/staff/applications">
      <button class="btn" type="submit" style="background:#ef4444;border-color:#ef4444">Delete</button>
    </form>

    <p style="margin-top:16px"><a href="/staff/applications">&larr; Back to applications</a></p>
  </div>
</div>

<style>
  .btn { background:#6d28d9;color:#fff;border:1px solid #6d28d9;border-radius:10px;padding:.45rem .8rem;cursor:pointer;font-weight:600 }
  .btn:hover { background:#5b21b6;border-color:#5b21b6 }
</style>

<%- include('../partials/footer.js') %>
