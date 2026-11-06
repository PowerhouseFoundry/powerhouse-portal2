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
    #staff-training .btn.outline { background:#fff; color:#6d28d9; border-color:#c4b5fd; }
    #staff-training .btn.outline:hover { background:#f5f3ff; border-color:#a78bfa; }
    #staff-training .btn.danger-soft { background:#fff; color:#991b1b; border-color:#fecaca; }
    #staff-training .btn.danger-soft:hover { background:#fff1f2; border-color:#fda4af; }
    #staff-training .btn.small { padding:5px 8px; font-size:.8rem; }
    #staff-training .resource-row { margin:.45rem 0; padding:.45rem 0; border-bottom:1px solid #f3f4f6; }
    #staff-training .resource-row:last-child { border-bottom:0; }
    #staff-training .resource-actions { display:flex; gap:6px; flex-wrap:wrap; margin-top:6px; }
    #staff-training .resource-actions form { margin:0; }
    #staff-training .publish-line { margin-top:7px; display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
    #staff-training .publish-label { font-size:.8rem; font-weight:700; color:#6b7280; }
    #staff-training .class-chip { display:inline-flex; align-items:center; gap:4px; border-radius:999px; padding:4px 7px; font-size:.76rem; font-weight:750; background:#ecfdf5; color:#166534; border:1px solid #bbf7d0; }
    #staff-training .class-chip.partial { background:#fff7ed; color:#9a3412; border-color:#fed7aa; }
    #staff-training .not-published { font-size:.8rem; color:#9ca3af; }
    #staff-training .upload-status { margin-top:8px; min-height:20px; font-size:.86rem; font-weight:650; }
    #staff-training .upload-status.info { color:#5b21b6; }
    #staff-training .upload-status.ok { color:#166534; }
    #staff-training .upload-status.error { color:#991b1b; }
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

    <% if (typeof resource_added !== 'undefined' && resource_added) { %>
      <div style="margin-bottom:12px;padding:10px 12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;border-radius:10px;font-weight:600;">Resource added successfully.</div>
    <% } %>
    <% if (typeof resource_error !== 'undefined' && resource_error) { %>
      <div style="margin-bottom:12px;padding:10px 12px;border:1px solid #fecaca;background:#fef2f2;color:#991b1b;border-radius:10px;font-weight:600;"><%= resource_error %></div>
    <% } %>
    <% if (typeof storageReady !== 'undefined') { %>
      <div style="margin-bottom:12px;padding:9px 11px;border:1px solid <%= storageReady ? '#bbf7d0' : '#fecaca' %>;background:<%= storageReady ? '#f0fdf4' : '#fef2f2' %>;color:<%= storageReady ? '#166534' : '#991b1b' %>;border-radius:10px;font-size:.9rem;">
        <strong>File storage:</strong> <%= storageMessage %>
      </div>
    <% } %>
    <% if (typeof resource_removed !== 'undefined' && resource_removed) { %>
      <div style="margin-bottom:12px;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e40af;border-radius:10px;font-weight:600;">Resource removed from learner profiles.</div>
    <% } %>
    <% if (typeof class_removed !== 'undefined' && class_removed) { %>
      <div style="margin-bottom:12px;padding:10px 12px;border:1px solid #bfdbfe;background:#eff6ff;color:#1e40af;border-radius:10px;font-weight:600;">This module's resources were removed from the selected class.</div>
    <% } %>
    <% if (typeof published !== 'undefined' && published) { %>
      <div style="margin-bottom:12px;padding:10px 12px;border:1px solid #bbf7d0;background:#f0fdf4;color:#166534;border-radius:10px;font-weight:600;">Resources published to the selected class. Existing copies were refreshed.</div>
    <% } %>

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
              <form class="resource-upload-form" method="post" action="/staff/training/modules/<%= m.key %>/resource" enctype="multipart/form-data">
                <label>Title <span class="muted" style="font-weight:400">(optional)</span></label>
                <input type="text" name="title" placeholder="Leave blank to use the file name">

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
                <input type="file" name="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4,.zip">
                <div class="muted" style="font-size:.85rem; margin-top:5px;">Choose a file, then press <strong>Add resource</strong>. If Title is blank, the file name will be used.</div>

                <div class="vspace">
                  <button class="btn upload-btn" type="submit">Add resource</button>
                  <div class="upload-status" role="status" aria-live="polite"></div>
                </div>
              </form>

              <!-- Existing resources -->
              <h4 class="vspace">Resources</h4>
              <% if (!resList.length) { %>
                <p class="muted">None yet.</p>
              <% } else { %>
                <ul style="margin:0; padding-left:16px;">
                  <% resList.forEach(function(r){ %>
                    <li class="resource-row">
                      <div>
                        <strong><%= r.title %></strong>
                        <% if (r.area) { %> <span class="muted"> — <%= r.area %></span> <% } %>
                        <% if (r.url) { %> — <a href="<%= r.url %>" target="_blank" rel="noopener">link</a> <% } %>
                        <% if (r.file_path) { %> — <a href="<%= r.file_path %>" target="_blank" rel="noopener">file</a> <% } %>
                      </div>
                      <% const pubList = (resourcePublications && resourcePublications[r.id]) ? resourcePublications[r.id] : []; %>
                      <div class="publish-line">
                        <span class="publish-label">Published to:</span>
                        <% if (!pubList.length) { %>
                          <span class="not-published">No classes</span>
                        <% } else { %>
                          <% pubList.forEach(function(pub){ %>
                            <span class="class-chip <%= pub.complete ? '' : 'partial' %>" title="<%= pub.publishedCount %> of <%= pub.totalCount %> learners have this resource">
                              <%= pub.className %> <%= pub.publishedCount %>/<%= pub.totalCount %>
                            </span>
                          <% }) %>
                        <% } %>
                      </div>
                      <div class="resource-actions">
                        <form method="post" action="/staff/training/modules/<%= m.key %>/resource/<%= r.id %>/unpublish"
                              onsubmit="return confirm('Remove this resource from learner profiles? The master copy will stay in Staff Training.')">
                          <button class="btn outline small" type="submit">Remove from learners</button>
                        </form>
                        <form method="post" action="/staff/training/modules/<%= m.key %>/resource/<%= r.id %>/delete"
                              onsubmit="return confirm('Delete this resource from Staff Training and remove all published learner copies?')">
                          <button class="btn danger-soft small" type="submit">Delete resource</button>
                        </form>
                      </div>
                    </li>
                  <% }) %>
                </ul>
              <% } %>

              <!-- Publish / remove from class -->
              <form method="post" action="/staff/training/modules/<%= m.key %>/publish" class="vspace">
                <label>Manage resources for class</label>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  <select name="class_id" required>
                    <% (classes || []).forEach(function(c){ %>
                      <option value="<%= c.id %>"><%= c.name %></option>
                    <% }) %>
                  </select>
                  <button class="btn" type="submit"
                          onclick="return confirm('Publish/refresh all current resources for this module to the selected class?')">Publish / refresh</button>
                  <button class="btn danger-soft" type="submit"
                          formaction="/staff/training/modules/<%= m.key %>/unpublish"
                          onclick="return confirm('Remove ALL resources from this module from the selected class?')">Remove from class</button>
                </div>
                <p class="muted">Publish/refresh replaces older copies for this module, so learners do not get duplicates or outdated resources.</p>
              </form>
            </div>
          <% }) %>
        </div>
      <% } %>
    </div>
  </div>
</div>

<script>
(function(){
  document.querySelectorAll('.resource-upload-form').forEach(function(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();

      const status = form.querySelector('.upload-status');
      const button = form.querySelector('.upload-btn');
      const fileInput = form.querySelector('input[type="file"][name="file"]');
      const urlInput = form.querySelector('input[name="url"]');
      const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
      const hasUrl = urlInput && String(urlInput.value || '').trim();

      if (!hasFile && !hasUrl) {
        status.className = 'upload-status error';
        status.textContent = 'Choose a file or enter a URL first.';
        return;
      }

      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = hasFile ? 'Uploading…' : 'Adding…';
      status.className = 'upload-status info';
      status.textContent = hasFile ? 'Uploading the file. Keep this page open.' : 'Adding the resource…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        let data = null;
        try { data = await response.json(); } catch(e) {}

        if (!response.ok || !data || !data.ok) {
          const message = data && data.error ? data.error : ('Upload failed. Server returned ' + response.status + '.');
          throw new Error(message);
        }

        status.className = 'upload-status ok';
        status.textContent = data.message || 'Resource added successfully.';
        button.textContent = 'Added';
        window.setTimeout(function(){ window.location.reload(); }, 500);
      } catch (err) {
        status.className = 'upload-status error';
        status.textContent = err && err.message ? err.message : 'The resource could not be uploaded.';
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  });
})();
</script>

<%- include('../partials/footer.js') %>
