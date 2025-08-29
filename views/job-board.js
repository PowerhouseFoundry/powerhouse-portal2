<% const title = 'Job Board'; const active = 'jobs'; %>
<%- include('partials/header.js', { title, active, user }) %>

<div class="container">
  <h1>Job Board</h1>

  <% if (!adverts || !adverts.length) { %>
    <p class="muted">No job adverts yet. Please check back soon.</p>
  <% } else { %>
    <div class="board">
      <% adverts.forEach(ad => {
           const stat = appMap && appMap.get ? appMap.get(ad.id) : null;
           const hasApplied = !!stat;
           const status = (stat && stat.status) ? stat.status : 'Submitted';
      %>
        <article class="card job">
          <div class="job-head">
            <div>
              <h2 class="job-title"><%= ad.title %></h2>
              <div class="job-meta muted">
                <span><strong><%= ad.employer %></strong></span>
                <% if (ad.location) { %> · <span><%= ad.location %></span><% } %>
                <% if (ad.closing_date) { %> · <span>Closes: <%= ad.closing_date %></span><% } %>
              </div>
            </div>

            <div class="job-actions">
              <% if (hasApplied) { %>
                <span class="badge <%= status==='Accepted'?'success':(status==='Declined'?'danger':'info') %>">
                  <%= status %>
                </span>
                <small class="muted" style="display:block; text-align:right; margin-top:.25rem">
                  Applied <%= stat.created_at %>
                </small>
              <% } else { %>
                <a class="btn" href="/apply/<%= ad.id %>">Apply</a>
              <% } %>
            </div>
          </div>

          <!-- Render description as HTML so staff formatting shows correctly -->
          <div class="job-desc prose">
            <%- ad.description || '' %>
          </div>
        </article>
      <% }) %>
    </div>
  <% } %>
</div>

<style>
  .board { display: grid; gap: .9rem; }
  .job { padding: 1rem; }
  .job-head { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; }
  .job-title { margin:0 0 .25rem 0; }
  .job-meta { font-size:.95rem; }
  .job-actions .badge { padding:.25rem .5rem; border-radius:.5rem; font-size:.8rem; }
  .badge.info { background:#e0f2fe; color:#0369a1; }
  .badge.success { background:#dcfce7; color:#166534; }
  .badge.danger { background:#fee2e2; color:#991b1b; }
  .prose :is(p, ul, ol) { margin:.5rem 0; }
  .prose ul { padding-left: 1.2rem; list-style: disc; }
</style>

<%- include('partials/footer.js') %>
