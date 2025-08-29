<%
  const title  = 'Training (Staff)';
  const active = 'staff-training';
  const AREAS = ['Kitchen','Warehouse','Bar','Restaurant','Barista','Office'];
%>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="staff-training">
  <style>
    #staff-training .wrap { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
    #staff-training h1 { margin:.25rem 0 1rem 0; }
    #staff-training .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:14px; position:relative; }
    #staff-training .muted { color:#6b7280; }
    #staff-training label { display:block; font-weight:600; margin:.25rem 0 .2rem; }
    #staff-training input[type="text"],
    #staff-training select,
    #staff-training input[type="file"] {
      width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; box-sizing:border-box; display:block;
    }
    /* Purple buttons */
    #staff-training .btn {
      background:#6d28d9; color:#fff; border:1px solid #6d28d9;
      border-radius:10px; padding:8px 12px; font-weight:600; cursor:pointer;
      display:inline-flex; align-items:center; justify-content:center; gap:.4rem;
      transition: background .2s, border-color .2s; white-space:nowrap; text-decoration:none;
    }
    #staff-training .btn:hover { background:#5b21b6; border-color:#5b21b6; }
    /* Icon buttons */
    #staff-training .btn-icon { background:none; border:none; cursor:pointer; padding:6px; margin:0; }
    #staff-training .btn-icon svg { width:18px; height:18px; fill:#374151; }
    #staff-training .btn-icon:hover svg { fill:#111827; }

    #staff-training .grid-3 { display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; }
    @media (max-width: 980px){ #staff-training .grid-3 { grid-template-columns: 1fr; } }
    #staff-training .vspace { margin-top: .5rem; }

    /* Top-right delete icon placement */
    #staff-training .module-actions {
      position:absolute; top:8px; right:8px; display:flex; gap:6px; align-items:center;
    }
  </style>

  <div class="wrap">
    <h1>Training modules</h1>

    <!-- Add module -->
    <div class="card">
      <h2 style="margin-top:0">Add module</h2>
      <form method="post" action="/staff/training/modules" style="display:flex; gap:12px; flex-wrap:wrap">
        <div style="min-width:260px; flex:1;">
          <label>Module key (no spaces, e.g. barista_foundations)</label>
          <input type="text" name="module_key" required>
        </div>
        <div style="min-width:260px; flex:1;">
          <label>Module name (visible to students)</label>
          <input type="text" name="module_name" required>
        </div>
        <div style="align-self:end">
          <button class="btn" type="submit">Add module</button>
        </div>
      </form>
    </div>

    <!-- Existing modules -->
    <div class="vspace"></div>
    <div class="card">
      <h2 style="margin-top:0">Current modules</h2>
      <% if (!modules || !modules.length) { %>
        <p class="muted">No modules yet.</p>
      <% } else { %>
        <div class="grid-3 vspace">
          <% modules.forEach(function(m){ 
               const resList = (moduleResources && moduleResources[m.key]) ? moduleResources[m.key] : [];
          %>
            <div class="card" style="border-radius:12px;">
              <!-- top-right actions -->
              <div class="module-actions">
                <form method="post" action="/staff/training/modules/<%= m.key %>/delete"
                      onsubmit="return confirm('Delete the module \\\"<%= m.name %>\\\" and ALL its resources (including copies already published to students)? This cannot be undone.')">
                  <button class="btn-icon" type="submit" title="Delete module" aria-label="Delete module">
                    <!-- Trash icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
                      <path d="M135.2 17.7C140.7 7.1 151.9 0 164.3 0H283.7c12.4 0 23.6 7.1 29.1 17.7L328 32h88c13.3 0 24 10.7 24 24s-10.7 24-24 24h-16l-21.2 339.4c-1.6 25.9-23.1 46.6-49 46.6H118.2c-25.9 0-47.4-20.7-49-46.6L48 80H32C18.7 80 8 69.3 8 56S18.7 32 32 32h88l15.2-14.3zM112 128l20.8 320h182.4L336 128H112z"/>
                    </svg>
                  </button>
                </form>
              </div>

              <h3 style="margin-top:0;"><%= m.name %> <span class="muted">(<%= m.key %>)</span></h3>

              <!-- Add resource -->
              <form method="post" action="/staff/training/modules/<%= m.key %>/resource" enctype="multipart/form-data">
                <label>Title</label>
                <input type="text" name="title" placeholder="e.g. Barista Basics Slides" required>

                <label class="vspace">Area</label>
                <select name="area">
                  <option value="">(none)</option>
                  <% AREAS.forEach(function(a){ %>
                    <option value="<%= a %>"><%= a %></option>
                  <% }) %>
                </select>

                <label class="vspace">URL (optional)</label>
                <input type="text" name="url" placeholder="https://...">

                <label class="vspace">Upload file (optional)</label>
                <input type="file" name="file">

                <div class="vspace">
                  <button class="btn" type="submit">Add resource</button>
                </div>
              </form>

              <!-- Existing resources -->
              <h4 class="vspace">Resources</h4>
              <% if (!resList.length) { %>
                <p class="muted">None yet.</p>
              <% } else { %>
                <ul style="margin:0; padding-left:16px;">
                  <% resList.forEach(function(r){ %>
                    <li style="margin:.25rem 0">
                      <span><%= r.title %></span>
                      <% if (r.area) { %> <span class="muted"> — <%= r.area %></span> <% } %>
                      <% if (r.url) { %> — <a href="<%= r.url %>" target="_blank">link</a> <% } %>
                      <% if (r.file_path) { %> — <a href="<%= r.file_path %>" target="_blank">file</a> <% } %>
                      <form method="post" action="/staff/training/modules/<%= m.key %>/resource/<%= r.id %>/delete" style="display:inline"
                            onsubmit="return confirm('Delete this resource?')">
                        <button class="btn-icon" type="submit" title="Delete resource" aria-label="Delete resource">
                          <!-- Trash icon -->
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" aria-hidden="true" focusable="false">
                            <path d="M135.2 17.7C140.7 7.1 151.9 0 164.3 0H283.7c12.4 0 23.6 7.1 29.1 17.7L328 32h88c13.3 0 24 10.7 24 24s-10.7 24-24 24h-16l-21.2 339.4c-1.6 25.9-23.1 46.6-49 46.6H118.2c-25.9 0-47.4-20.7-49-46.6L48 80H32C18.7 80 8 69.3 8 56S18.7 32 32 32h88l15.2-14.3zM112 128l20.8 320h182.4L336 128H112z"/>
                          </svg>
                        </button>
                      </form>
                    </li>
                  <% }) %>
                </ul>
              <% } %>

              <!-- Publish to class -->
              <form method="post" action="/staff/training/modules/<%= m.key %>/publish" class="vspace">
                <label>Publish these resources to class</label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <select name="class_id" required>
                    <% (classes || []).forEach(function(c){ %>
                      <option value="<%= c.id %>"><%= c.name %></option>
                    <% }) %>
                  </select>
                  <button class="btn" type="submit" onclick="return confirm('Copy all resources to all students in selected class?')">Publish</button>
                </div>
                <p class="muted">Publishes each resource to every student in the selected class, keeping the chosen Area.</p>
              </form>
            </div>
          <% }) %>
        </div>
      <% } %>
    </div>
  </div>
</div>

<%- include('../partials/footer.js') %>
