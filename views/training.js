<%
  const title = 'Training';
  const active = 'training';
  const doneCount = (modules || []).filter(m => m.done).length;
  const totalCount = (modules || []).length;
%>
<%- include('partials/header.js', { title, active, user }) %>

<div id="student-training">
  <style>
    #student-training .wrap{width:min(1120px,calc(100% - 32px));margin:0 auto;padding:30px 0 46px}#student-training .training-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:18px}#student-training .training-hero p{color:var(--muted);margin:7px 0 0;max-width:700px}#student-training .progress-chip{background:var(--purple-950);color:#fff;border-radius:14px;padding:12px 15px;min-width:150px}#student-training .progress-chip small{display:block;color:rgba(255,255,255,.58);font-weight:800;font-size:.68rem;letter-spacing:.08em}#student-training .progress-chip strong{display:block;font-size:1.3rem;margin-top:2px}#student-training .training-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr);gap:16px}#student-training .training-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:var(--shadow-sm)}#student-training .module-list{display:grid;gap:9px;margin-top:16px}#student-training .module-item{display:grid;grid-template-columns:24px 1fr;align-items:center;gap:12px;padding:13px;border:1px solid var(--line);border-radius:13px;background:#fdfcfc;font-weight:650;cursor:pointer}#student-training .module-item:has(input:checked){border-color:#cbd7a3;background:#fafcef}#student-training .module-item input{width:20px;height:20px;accent-color:var(--purple-700)}#student-training .resources{display:grid;gap:12px}#student-training .area{padding-top:12px;border-top:1px solid var(--line)}#student-training .area:first-of-type{border-top:0;padding-top:0}#student-training .area h3{margin:0 0 7px}#student-training ul.links{margin:0;padding-left:18px}#student-training ul.links li{margin:.45rem 0}#student-training .res-link{word-break:break-word}@media(max-width:850px){#student-training .training-layout{grid-template-columns:1fr}}@media(max-width:600px){#student-training .wrap{width:calc(100% - 22px);padding-top:20px}#student-training .training-hero{align-items:flex-start;flex-direction:column}#student-training .progress-chip{width:100%}}
  </style>

  <div class="wrap">
    <div class="training-hero">
      <div>
        <span class="eyebrow">WORKPLACE DEVELOPMENT</span>
        <h1>Training</h1>
        <p>Keep track of your modules and open resources shared by staff for your workplace areas.</p>
      </div>
      <div class="progress-chip">
        <small>MODULE PROGRESS</small>
        <strong><%= doneCount %> / <%= totalCount %></strong>
      </div>
    </div>

    <div class="training-layout">
      <section class="training-card">
        <span class="eyebrow">MY MODULES</span>
        <h2>Training checklist</h2>
        <form method="post" action="/training">
          <div class="module-list">
            <% (modules||[]).forEach(function(m){ %>
              <label class="module-item">
                <input type="checkbox" name="mod_<%= m.key %>" <%= m.done ? 'checked' : '' %> >
                <span><%= m.name %></span>
              </label>
            <% }) %>
          </div>
          <div style="margin-top:16px"><button class="btn" type="submit">Save progress</button></div>
        </form>
      </section>

      <section class="training-card">
        <span class="eyebrow">FROM STAFF</span>
        <h2>Workplace resources</h2>
        <div class="resources" style="margin-top:16px">
          <% const order = (AREAS||[]); let anyShown = false; %>
          <% order.forEach(function(area){ const list = (resourcesByArea && resourcesByArea[area]) ? resourcesByArea[area] : []; if (list.length) { anyShown = true; %>
            <section class="area">
              <h3><%= area %></h3>
              <ul class="links">
                <% list.forEach(function(r){ %>
                  <li>
                    <% if (r.url) { %><a class="res-link" href="<%= r.url %>" target="_blank" rel="noopener"><%= r.title %></a>
                    <% } else if (r.file_path) { %><a class="res-link" href="<%= r.file_path %>" target="_blank" rel="noopener"><%= r.title %></a>
                    <% } else { %><span class="res-link"><%= r.title %></span><% } %>
                  </li>
                <% }) %>
              </ul>
            </section>
          <% } }) %>

          <% if (!anyShown) { %><p class="muted">No resources yet. Staff can publish resources here for your class.</p><% } %>

          <% if ((miscResources||[]).length) { %>
            <section class="area"><h3>Other</h3><ul class="links">
              <% miscResources.forEach(function(r){ %><li>
                <% if (r.url) { %><a class="res-link" href="<%= r.url %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else if (r.file_path) { %><a class="res-link" href="<%= r.file_path %>" target="_blank" rel="noopener"><%= r.title %></a>
                <% } else { %><span class="res-link"><%= r.title %></span><% } %>
              </li><% }) %>
            </ul></section>
          <% } %>
        </div>
      </section>
    </div>
  </div>
</div>

<%- include('partials/footer.js') %>
