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
        <p>Complete the application in one session or save it and continue another day.</p>
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

      <% if (submitted) { %>
        <div class="notice success-note">
          <strong>Application submitted.</strong>
          Your application status is <strong><%= submitted.status %></strong>.
          It was submitted on <strong><%= submitted.created_at %></strong>.
          <% if (submitted.cv_path) { %>
            <span class="notice-link"><a href="<%= submitted.cv_path %>" target="_blank" rel="noopener">View uploaded CV</a></span>
          <% } %>
        </div>
        <p class="muted submitted-help">This application has been sent for the workplace simulation and can no longer be edited.</p>
      <% } else { %>
        <% if (saved) { %>
          <div class="notice success-note"><strong>Draft saved.</strong> You can log out and continue this application next time.</div>
        <% } %>
        <% if (incomplete) { %>
          <div class="notice warning-note"><strong>Not submitted yet.</strong> Some required sections are incomplete, so your work has been saved as a draft.</div>
        <% } %>
        <% if (fresh) { %>
          <div class="notice info-note"><strong>New application started.</strong> The previous saved draft has been deleted.</div>
        <% } %>

        <% if (draft) { %>
          <div class="draft-panel">
            <div>
              <span class="badge draft-badge">Draft saved</span>
              <strong>Continue your saved application</strong>
              <p class="muted">Last saved: <%= draft.updated_at || draft.created_at %>. Drafts are kept for <%= draftDays %> days from when they are first started.</p>
            </div>
            <form method="post" action="/apply/<%= ad.id %>/start-new"
                  onsubmit="return confirm('Start a new application? Your saved draft for this job will be permanently deleted. This cannot be undone.')">
              <button class="btn danger-outline" type="submit">Start new application</button>
            </form>
          </div>
        <% } %>

        <form method="post" action="/apply/<%= ad.id %>" enctype="multipart/form-data" class="apply-form">
          <div class="row two">
            <label class="field">
              <span class="label">Full name</span>
              <input type="text" name="full_name" value="<%= draft ? (draft.applicant_name || user.full_name) : user.full_name %>" required>
            </label>
            <label class="field">
              <span class="label">Email</span>
              <input type="email" name="email" value="<%= draft ? (draft.applicant_email || '') : '' %>" placeholder="name@example.com" required>
            </label>
          </div>

          <label class="field">
            <span class="label">Why are you suitable for this role?</span>
            <textarea name="why" rows="7" placeholder="Explain why you are interested in the role. Include your skills, experience and what you could bring to the workplace." required><%= draft ? (draft.statement || '') : '' %></textarea>
          </label>

          <label class="field">
            <span class="label">Upload a CV (optional)</span>
            <input type="file" name="cv_file" accept=".pdf,.doc,.docx">
            <% if (draft && draft.cv_path) { %>
              <small class="muted">Saved with this draft: <a href="<%= draft.cv_path %>" target="_blank" rel="noopener">View CV</a>. Uploading a new file will replace it.</small>
            <% } %>
          </label>

          <div class="save-explainer">
            <strong>Not finished?</strong>
            <span>Choose <strong>Save for later</strong>. Your answers will be waiting when you next log in.</span>
          </div>

          <div class="actions application-actions">
            <button class="btn outline save-draft" type="submit" name="action" value="save" formnovalidate>Save for later</button>
            <button class="btn" type="submit" name="action" value="submit">Submit application</button>
          </div>
        </form>
      <% } %>

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
  .apply-card,.apply-card *{box-sizing:border-box}.apply-card{padding:24px}.apply-head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;margin-bottom:1rem}.apply-title{margin:0 0 .25rem}.apply-meta{margin:0}.notice{padding:.78rem .9rem;border-radius:12px;margin-bottom:1rem;border:1px solid}.success-note{background:#edf8f0;color:#235f3f;border-color:#cfe7d7}.warning-note{background:#fff8e5;color:#725817;border-color:#eedda9}.info-note{background:#eef4fb;color:#285d85;border-color:#cfdeeb}.notice-link{margin-left:.5rem}.submitted-help{margin:.25rem 0 1rem}.apply-form{display:grid;gap:1rem}.apply-form .row.two{display:grid;grid-template-columns:1fr 1fr;gap:.9rem}.draft-panel{display:flex;justify-content:space-between;gap:1rem;align-items:center;background:#fbf8fd;border:1px solid #e4d9e8;border-radius:14px;padding:14px 16px;margin-bottom:1rem}.draft-panel p{margin:.35rem 0 0}.draft-badge{background:#fff1c9;color:#715510;margin-right:.55rem}.danger-outline{background:#fff!important;color:#a52a2a!important;border-color:#e5b8b8!important}.danger-outline:hover{background:#fff3f3!important;border-color:#cf8d8d!important}.save-explainer{display:flex;gap:.45rem;flex-wrap:wrap;background:#f7f5f8;border-radius:12px;padding:11px 13px;color:#4b3e50}.actions{display:flex;gap:.6rem;justify-content:flex-end;border-top:1px solid var(--line);padding-top:1rem;margin-top:.25rem}.application-actions .btn{min-width:155px}.apply-desc{margin-top:1.5rem;border-top:1px solid var(--line);padding-top:1.3rem}@media(max-width:720px){.apply-form .row.two{grid-template-columns:1fr}.apply-head,.draft-panel{flex-direction:column;align-items:stretch}.actions{justify-content:stretch;flex-direction:column}.actions .btn,.draft-panel .btn{width:100%}}
</style>

<%- include('partials/footer.js') %>
