<% const title = 'Apply'; const active = 'jobs'; %>
<%- include('partials/header.js', { title, active, user }) %>

<div class="container">
  <% if (!ad) { %>
    <div class="card"><p class="muted">This job advert is no longer available.</p></div>
  <% } else { %>
    <article class="card apply-card">
      <header class="apply-head">
        <div>
          <h1 class="apply-title">Apply for: <%= ad.title %></h1>
          <p class="apply-meta muted">
            <strong><%= ad.employer %></strong>
            <% if (ad.location) { %> · <%= ad.location %><% } %>
            <% if (ad.closing_date) { %> · Closes: <%= ad.closing_date %><% } %>
          </p>
        </div>
        <a class="btn outline" href="/job-board">Back</a>
      </header>

      <% if (existing) { %>
        <div class="notice info">
          You already applied to this job on <strong><%= existing.created_at %></strong>.
          Status: <strong><%= existing.status %></strong>.
          <% if (existing.cv_path) { %>
            &nbsp;|&nbsp;<a href="<%= existing.cv_path %>" target="_blank" rel="noopener">View uploaded CV</a>
          <% } %>
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
          <span class="label">Personal statement</span>
          <textarea name="why" rows="7" placeholder="Explain succinctly why you’re applying and what attracts you to this role. Mention relevant skills, experience, and what you’ll bring to the team." required></textarea>
        </label>

        <label class="field">
          <span class="label">Upload your CV (optional, .pdf / .doc / .docx)</span>
          <input type="file" name="cv_file" accept=".pdf,.doc,.docx">
          <% if (existing && existing.cv_path) { %>
            <small class="muted">Previously uploaded: <a href="<%= existing.cv_path %>" target="_blank" rel="noopener">View CV</a></small>
          <% } %>
        </label>

        <div class="actions">
          <% if (!existing) { %>
            <button class="btn" type="submit">Submit application</button>
          <% } else { %>
            <button class="btn" type="submit" disabled title="You have already applied">Already applied</button>
          <% } %>
        </div>
      </form>

      <% if (ad.description) { %>
        <section class="apply-desc">
          <h2>About this role</h2>
          <div class="prose">
            <%- ad.description %>
          </div>
        </section>
      <% } %>
    </article>
  <% } %>
</div>

<style>
  /* Ensure inputs never overflow card padding */
  .apply-card, .apply-card * { box-sizing: border-box; }

  .apply-card { padding: 1.25rem; }
  .apply-head {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    margin-bottom: .75rem;
  }
  .apply-title { margin: 0 0 .25rem 0; }
  .apply-meta { margin: 0; }

  .notice.info {
    background: #e0f2fe; color: #075985;
    padding: .6rem .8rem; border-radius: .6rem; margin-bottom: 1rem;
  }

  .apply-form { display: grid; gap: .9rem; }
  .apply-form .row.two {
    display: grid; grid-template-columns: 1fr 1fr; gap: .75rem;
  }
  @media (max-width: 720px) {
    .apply-form .row.two { grid-template-columns: 1fr; }
  }

  .field { display: grid; gap: .35rem; }
  .label { font-weight: 600; color: #111827; }

  .field input[type="text"],
  .field input[type="email"],
  .field input[type="file"],
  .field textarea,
  .field select {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #fff;
    border-radius: .6rem;
    padding: .6rem .7rem;
    font: inherit;
    line-height: 1.4;
    outline: none;
  }
  .field textarea { resize: vertical; min-height: 150px; }

  /* Keep inputs visually inside card border with a little inner gap */
  .apply-card .field > *:not(.label) {
    margin: 0;
  }

  .actions {
    display: flex; gap: .6rem; justify-content: flex-end;
    border-top: 1px solid #f3f4f6; padding-top: .8rem; margin-top: .4rem;
  }

  .apply-desc { margin-top: 1.2rem; }
  .apply-desc h2 { margin: 0 0 .4rem 0; }
  .prose :is(p, ul, ol) { margin: .45rem 0; }
  .prose ul { padding-left: 1.15rem; list-style: disc; }

  /* Button hover (green highlight as per your global tweak) */
  .btn:hover { background: #10b981; border-color: #10b981; color: #fff; }
</style>

<%- include('partials/footer.js') %>
