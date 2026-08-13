<% const title = 'Practice Jobs'; const active = 'jobs'; %>
<%- include('partials/header.js', { title, active, user }) %>

<div class="container">
  <div class="page-intro">
    <div>
      <span class="eyebrow">WORKPLACE PRACTICE</span>
      <h1>Practice Jobs</h1>
      <p>Read realistic job adverts, decide which roles suit you and practise completing an application.</p>
    </div>
    <span class="training-label">Training simulation</span>
  </div>

  <% if (!adverts || !adverts.length) { %>
    <div class="card"><p class="muted" style="margin:0">No practice job adverts are available yet. Please check back soon.</p></div>
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
              <span class="eyebrow">PRACTICE VACANCY</span>
              <h2 class="job-title"><%= ad.title %></h2>
              <div class="job-meta muted">
                <span><strong><%= ad.employer %></strong></span>
                <% if (ad.location) { %> · <span><%= ad.location %></span><% } %>
                <% if (ad.closing_date) { %> · <span>Closes: <%= ad.closing_date %></span><% } %>
              </div>
            </div>

            <div class="job-actions">
              <% if (hasApplied) { %>
                <span class="badge <%= status==='Accepted'?'success':(status==='Declined'?'danger':'info') %>"><%= status %></span>
                <small class="muted" style="display:block; text-align:right; margin-top:.35rem">Applied <%= stat.created_at %></small>
              <% } else { %>
                <a class="btn" href="/apply/<%= ad.id %>">Practise applying</a>
              <% } %>
            </div>
          </div>

          <div class="job-desc prose"><%- ad.description || '' %></div>
        </article>
      <% }) %>
    </div>
  <% } %>
</div>

<%- include('partials/footer.js') %>
