<% const title = 'Application'; const active = 'staff-dashboard'; %>
<%- include('../partials/header.js', { title, active, staff }) %>

<div class="container">
  <h1>Application</h1>

  <div class="card">
    <h2><%= app.advert_title || app.role || 'Application' %></h2>
    <p class="muted">
      <strong><a href="/staff/student/<%= app.student_id %>"><%= app.student_name %></a></strong>
      <% if (app.employer) { %> — <%= app.employer %><% } %>
    </p>
    <p class="muted">Submitted: <%= app.created_at %></p>
    <p><strong>Status:</strong> <%= app.status %></p>

    <% if (app.cv_path) { %>
      <p style="margin-top:.5rem"><strong>CV:</strong> <a href="<%= app.cv_path %>" target="_blank" rel="noopener">Download</a></p>
    <% } %>

    <div style="margin-top:1rem">
      <h3 class="muted">Applicant statement</h3>
      <p style="white-space:pre-wrap"><%= (typeof statement !== 'undefined' && statement) ? statement : '—' %></p>

      <details style="margin-top:.5rem">
        <summary>View raw submission</summary>
        <pre style="white-space:pre-wrap; margin-top:.5rem"><%= (typeof rawNotes !== 'undefined' && rawNotes) ? rawNotes : '' %></pre>
      </details>
    </div>

    <form method="post" action="/staff/applications/<%= app.id %>/status" class="grid four" style="margin-top:1rem; gap:.5rem">
      <input type="hidden" name="_method" value="post">
      <button class="btn" name="status" value="In Review"  type="submit">Mark In Review</button>
      <button class="btn" name="status" value="Accepted"   type="submit">Accept</button>
      <button class="btn" name="status" value="Declined"   type="submit">Decline</button>
      <button class="btn outline" formaction="/staff/applications/<%= app.id %>/delete" formmethod="post" type="submit" onclick="return confirm('Delete this application?')">Delete</button>
    </form>
  </div>

  <div style="margin-top:1rem">
    <a class="btn outline" href="/staff/dashboard">Back to dashboard</a>
  </div>
</div>

<%- include('../partials/footer.js') %>
