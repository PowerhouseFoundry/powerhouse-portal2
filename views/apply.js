<% const title = 'Practice Application'; const active = 'jobs'; %>
<%- include('partials/header.js', { title, active, user }) %>

<div class="container">
  <% if (!ad) { %>
    <div class="card"><p class="muted">This practice job advert is no longer available.</p></div>
  <% } else { %>
    <div class="page-intro">
      <div>
        <span class="eyebrow">WORKPLACE PRACTICE</span>
        <h1>Practice application</h1>
        <p>Use this form to practise presenting yourself professionally to an employer.</p>
      </div>
      <span class="training-label">Training simulation</span>
    </div>

    <article class="card apply-card">
      <header class="apply-head">
        <div>
          <h2 class="apply-title"><%= ad.title %></h2>
          <p class="apply-meta muted">
            <strong><%= ad.employer %></strong>
            <% if (ad.location) { %> · <%= ad.location %><% } %>
            <% if (ad.closing_date) { %> · Closes: <%= ad.closing_date %><% } %>
          </p>
        </div>
        <a class="btn outline" href="/job-board">Back to jobs</a>
      </header>

      <% if (existing) { %>
        <div class="notice info">
          You already completed this practice application on <strong><%= existing.created_at %></strong>.
          Status: <strong><%= existing.status %></strong>.
          <% if (existing.cv_path) { %>&nbsp;|&nbsp;<a href="<%= existing.cv_path %>" target="_blank" rel="noopener">View uploaded CV</a><% } %>
        </div>
      <% } %>

      <form method="post" action="/apply/<%= ad.id %>" enctype="multipart/form-data" class="apply-form">
        <div class="row two">
          <label class="field">
            <span class="label">Full name</span>
            <input type="text" name="full_name" value="<%= user.full_name %>" required>
          </label>
          <label class="field">
            <span class="label">Email</span>
            <input type="email" name="email" value="" placeholder="name@example.com" required>
          </label>
        </div>

        <label class="field">
          <span class="label">Why are you suitable for this role?</span>
          <textarea name="why" rows="7" placeholder="Explain why you are interested in the role. Include your skills, experience and what you could bring to the workplace." required></textarea>
        </label>

        <label class="field">
          <span class="label">Upload a CV (optional)</span>
          <input type="file" name="cv_file" accept=".pdf,.doc,.docx">
          <% if (existing && existing.cv_path) { %><small class="muted">Previously uploaded: <a href="<%= existing.cv_path %>" target="_blank" rel="noopener">View CV</a></small><% } %>
        </label>

        <div class="actions">
          <% if (!existing) { %>
            <button class="btn" type="submit">Submit practice application</button>
          <% } else { %>
            <button class="btn" type="submit" disabled title="You have already applied">Already completed</button>
          <% } %>
        </div>
      </form>

      <% if (ad.description) { %>
        <section class="apply-desc">
          <h2>About this role</h2>
          <div class="prose"><%- ad.description %></div>
        </section>
      <% } %>
    </article>
  <% } %>
</div>

<style>
  .apply-card,.apply-card *{box-sizing:border-box}.apply-card{padding:24px}.apply-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}.apply-title{margin:0 0 .25rem}.apply-meta{margin:0}.notice.info{background:#eaf3fb;color:#245b86;border:1px solid #cfdfec;padding:.7rem .85rem;border-radius:12px;margin-bottom:1rem}.apply-form{display:grid;gap:1rem}.apply-form .row.two{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.actions{display:flex;gap:.6rem;justify-content:flex-end;border-top:1px solid var(--line);padding-top:1rem;margin-top:.25rem}.apply-desc{margin-top:1.5rem;border-top:1px solid var(--line);padding-top:1.3rem}@media(max-width:720px){.apply-form .row.two{grid-template-columns:1fr}.apply-head{flex-direction:column}.actions{justify-content:stretch}.actions .btn{width:100%}}
</style>

<%- include('partials/footer.js') %>
