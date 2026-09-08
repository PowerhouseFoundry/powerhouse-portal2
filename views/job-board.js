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
           const hasApplication = !!stat;
           const status = (stat && stat.status) ? stat.status : '';
           const isDraft = status === 'Draft';
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
              <% if (!hasApplication) { %>
                <a class="btn" href="/apply/<%= ad.id %>">Start application</a>
              <% } else if (isDraft) { %>
                <span class="badge draft-status">Draft saved</span>
                <small class="muted draft-date">Last saved <%= stat.updated_at || stat.created_at %></small>
                <a class="btn" href="/apply/<%= ad.id %>">Continue application</a>
                <form method="post" action="/apply/<%= ad.id %>/start-new"
                      onsubmit="return confirm('Start a new application? Your saved draft for this job will be permanently deleted. This cannot be undone.')">
                  <button class="btn outline new-app-btn" type="submit">Start new application</button>
                </form>
              <% } else { %>
                <span class="badge <%= status==='Accepted'?'success':(status==='Declined'?'danger':'info') %>"><%= status %></span>
                <small class="muted applied-date">Submitted <%= stat.created_at %></small>
                <a class="btn outline" href="/apply/<%= ad.id %>">View status</a>
              <% } %>
            </div>
          </div>

          <% if (isDraft) { %>
            <div class="draft-reminder">
              <strong>Your application is not submitted yet.</strong>
              Continue and submit it within <%= draftDays %> days of starting it, or the draft will reset automatically.
            </div>
          <% } %>

          <div class="job-desc prose"><%- ad.description || '' %></div>
        </article>
      <% }) %>
    </div>
  <% } %>
</div>

<style>
  .job-actions{min-width:190px}.job-actions form{margin:0}.job-actions .btn{width:100%;justify-content:center}.draft-status{background:#fff1c9;color:#715510}.draft-date,.applied-date{display:block;text-align:right;margin:.35rem 0 .55rem}.new-app-btn{margin-top:.4rem}.draft-reminder{margin:.8rem 0 .2rem;padding:10px 12px;border-radius:11px;background:#fff8e5;border:1px solid #eedda9;color:#66501a;font-size:.9rem}@media(max-width:720px){.job-actions{min-width:0;width:100%}.draft-date,.applied-date{text-align:left}}
</style>

<%- include('partials/footer.js') %>
