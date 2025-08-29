<%
  // Defensive default so template never crashes
  const title  = 'Staff Dashboard';
  const active = 'staff-dashboard';
  const _ads = (typeof ads !== 'undefined' && Array.isArray(ads)) ? ads : [];
%>
<%- include('../partials/header.js', { title, active, staff }) %>

<div id="jobs-page">
  <style>
    /* ===== SCOPED TO #jobs-page ONLY ===== */
    #jobs-page .wrap { max-width: 980px; margin: 0 auto; }
    #jobs-page .grid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:1rem; align-items:stretch; grid-auto-rows: 1fr; }
    #jobs-page .card { border:1px solid var(--border,#e5e7eb); background:#fff; border-radius:14px; padding:14px; display:flex; flex-direction:column; height:100%; }
    #jobs-page .toolbar { display:flex; flex-wrap:wrap; gap:.4rem; margin:.4rem 0; }
    #jobs-page .toolbar button { border:1px solid #d1d5db; background:#fff; border-radius:8px; padding:.25rem .5rem; cursor:pointer; }
    #jobs-page .editor { border:1px solid #d1d5db; border-radius:8px; min-height:140px; padding:.6rem .7rem; flex:1; }
    #jobs-page .ad-list { display:grid; gap:.75rem; overflow:auto; }
    #jobs-page .ad-item { border:1px solid var(--border,#e5e7eb); border-radius:12px; padding:.8rem; display:grid; gap:.4rem; }
    #jobs-page .row { display:grid; grid-template-columns: 1fr auto; gap:.5rem; align-items:center; }
    #jobs-page .muted { color:#6b7280; font-size:.9rem; }
    #jobs-page input[type="text"], 
    #jobs-page input[type="number"] {
      width:100%; border:1px solid #d1d5db; border-radius:10px; padding:10px 12px; box-sizing:border-box; display:block;
    }
    #jobs-page label { display:block; font-weight:600; margin:.25rem 0 .2rem; }

    /* ===== PURPLE BUTTONS (matching your theme) ===== */
    #jobs-page .btn {
      background:#6d28d9;       /* purple */
      color:#fff;
      border:1px solid #6d28d9;
      border-radius:10px;
      padding:.5rem .8rem;
      cursor:pointer;
      font-weight:600;
      transition: background 0.2s, border-color 0.2s;
    }
    #jobs-page .btn:hover {
      background:#5b21b6;       /* darker purple on hover */
      border-color:#5b21b6;
    }
  </style>

  <div class="wrap">
    <h1>Job Board</h1>

    <div class="grid-2">
      <div class="card">
        <h2>Create advert</h2>
        <form method="post" action="/staff/jobs/create">
          <label>Job title</label>
          <input type="text" name="title" required>

          <label class="muted">Description</label>
          <div class="toolbar">
            <button type="button" onclick="cmd('bold')"><strong>B</strong></button>
            <button type="button" onclick="cmd('italic')"><em>I</em></button>
            <button type="button" onclick="cmd('insertUnorderedList')">• List</button>
            <button type="button" onclick="cmd('insertOrderedList')">1. List</button>
          </div>
          <div id="rte" class="editor" contenteditable="true" oninput="syncEditor()"></div>
          <textarea id="desc" name="description" style="display:none"></textarea>

          <label class="vspace">Pay (£/hour)</label>
          <input type="number" name="pay_per_hour" step="0.01" min="0" placeholder="e.g. 11.44">

          <div style="margin-top:.6rem">
            <button class="btn" type="submit">Post advert</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2>Existing adverts</h2>
        <div class="ad-list">
          <% if (!_ads.length) { %>
            <p class="muted">No adverts yet.</p>
          <% } else { %>
            <% _ads.forEach(ad => { %>
              <div class="ad-item">
                <div class="row">
                  <strong><%= ad.title %></strong>
                  <form method="post" action="/staff/jobs/<%= ad.id %>/delete" onsubmit="return confirm('Delete this advert?')">
                    <button class="btn" type="submit">Delete</button>
                  </form>
                </div>
                <div class="muted"><%= ad.created_at %></div>
                <% if (typeof ad.pay_per_hour !== 'undefined' && ad.pay_per_hour !== null && ad.pay_per_hour !== '') { %>
                  <div><strong>Pay:</strong> £<%= Number(ad.pay_per_hour).toFixed(2) %> / hour</div>
                <% } %>
                <div><%- ad.description %></div>
              </div>
            <% }) %>
          <% } %>
        </div>
      </div>
    </div>
  </div>

  <script>
    function cmd(action){ document.execCommand(action, false, null); }
    function syncEditor(){
      const rte = document.getElementById('rte');
      const ta = document.getElementById('desc');
      ta.value = rte.innerHTML;
    }
  </script>
</div>

<%- include('../partials/footer.js') %>
