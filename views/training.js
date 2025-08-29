<%
  const title = 'Training';
  const active = 'training';
%>
<%- include('partials/header.js', { title, active, user }) %>

<div id="student-training">
  <style>
    #student-training .wrap { max-width: 1000px; margin: 0 auto; padding: 0 16px; }
    #student-training h1 { margin:.25rem 0 1rem 0; }
    #student-training .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; }
    #student-training .muted { color:#6b7280; }

    #student-training .btn {
      background:#6d28d9; color:#fff; border:1px solid #6d28d9;
      border-radius:10px; padding:8px 12px; font-weight:600; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
      transition: background .2s, border-color .2s; white-space:nowrap; text-decoration:none;
    }
    #student-training .btn:hover { background:#5b21b6; border-color:#5b21b6; }

    #student-training .resources { display:grid; gap:12px; }
    #student-training .area { margin-top: 1rem; }
    #student-training .area h3 { margin:.25rem 0 .5rem; }
    #student-training ul.links { margin:0; padding-left:18px; }
    #student-training ul.links li { margin:.3rem 0; }
    #student-training .res-link { word-break: break-word; }
  </style>

  <div class="wrap">
    <h1>Training</h1>

    <!-- Progress modules (unchanged) -->
    <div class="card">
      <h2 style="margin-top:0">Your modules</h2>
      <form method="post" action="/training">
        <div class="resources">
          <% (modules||[]).forEach(function(m){ %>
            <label style="display:flex; gap:10px; align-items:center;">
              <input type="checkbox" name="mod_<%= m.key %>" <%= m.done ? 'checked' : '' %> >
              <span><%= m.name %></span>
            </label>
          <% }) %>
        </div>
        <div style="margin-top:.75rem;">
          <button class="btn" type="submit">Save progress</button>
        </div>
      </form>
    </div>

    <!-- Teacher resources grouped by area -->
    <div class="card" style="margin-top:12px;">
      <h2 style="margin-top:0">Resources from your teacher</h2>

      <% const order = (AREAS||[]); %>
      <% let anyShown = false; %>

      <% order.forEach(function(area){ 
           const list = (resourcesByArea && resourcesByArea[area]) ? resourcesByArea[area] : [];
           if (list.length) { anyShown = true; %>
        <section class="area">
          <h3><%= area %></h3>
          <ul class="links">
            <% list.forEach(function(r){ %>
              <li>
                <% if (r.url) { %>
                  <a class="res-link" href="<%= r.url %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else if (r.file_path) { %>
                  <a class="res-link" href="<%= r.file_path %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else { %>
                  <span class="res-link"><%= r.title %></span>
                <% } %>
              </li>
            <% }) %>
          </ul>
        </section>
      <% } }) %>

      <% if (!anyShown) { %>
        <p class="muted">No resources yet. Your teacher can publish resources here for your class.</p>
      <% } %>

      <% if ((miscResources||[]).length) { %>
        <section class="area">
          <h3>Other</h3>
          <ul class="links">
            <% miscResources.forEach(function(r){ %>
              <li>
                <% if (r.url) { %>
                  <a class="res-link" href="<%= r.url %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else if (r.file_path) { %>
                  <a class="res-link" href="<%= r.file_path %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else { %>
                  <span class="res-link"><%= r.title %></span>
                <% } %>
              </li>
            <% }) %>
          </ul>
        </section>
      <% } %>
    </div>
  </div>
</div>

<%- include('partials/footer.js') %>
