<% const title = 'Home'; const active = 'home'; %>
<%- include('partials/header.js', { title, active, user }) %>

<!--
  NOTE: We wrap the page in #home-root and scope all hero/intro styles to it,
  so global CSS cannot override our colors/alignment/opacity.
-->
<div id="home-root">

<style>
  /* ===== Page-scoped utility (container-like, without using your global .container) ===== */
  #home-root .local-container {
    max-width: 1100px;
    margin-inline: auto;
    padding-inline: 16px;
  }

  /* ===== HERO (photo + overlay) ===== */
  #home-root .hero { position: relative; overflow: hidden; }
  #home-root .hero-bg {
    position: relative;
    min-height: 260px; /* banner height */
    background: url("/images/hero-photo.jpg") center/cover no-repeat; /* base: photo */
    isolation: isolate; /* keep z-index layers scoped to this element */
  }
  /* Lighter green→purple tint so the photo shows more */
  #home-root .hero-bg::before {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(90deg, rgba(16,185,129,0.20), rgba(124,58,237,0.20)); /* 20% tint */
    z-index: 1;
    pointer-events: none;
  }
  /* Decorative SVG overlay above tint (clearly visible) */
  #home-root .hero-bg > img.hero-overlay {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    opacity: 0.9;
    z-index: 2;
    pointer-events: none;
  }

  /* ===== INTRO BAND (solid gradient, page-scoped classes — no .muted/.container) ===== */
  #home-root .intro-band {
    background: linear-gradient(90deg, #10b981, #7c3aed); /* matches hero colours */
    padding: 18px 0;
  }
  /* Bulletproof text: left, white, not transparent, cannot be overridden by globals */
  #home-root .intro-title,
  #home-root .intro-sub {
    color: #ffffff !important;
    opacity: 1 !important;
    filter: none !important;
    mix-blend-mode: normal !important;
    text-align: left !important;
  }
  #home-root .intro-title {
    margin: 0 0 .35rem 0;
    font-size: 2rem;
    line-height: 1.2;
  }
  #home-root .intro-sub {
    margin: 0;
    font-size: 1.1rem;
  }

  /* ===== QUICK LINKS (unchanged) ===== */
  #home-root .quick-links .card {
    display: grid; grid-template-columns: 56px 1fr;
    align-items: center; gap: 12px;
  }
  #home-root .thumb { width: 56px; height: 56px; display: grid; place-items: center; border-radius: 14px; color: #fff; }
  #home-root .thumb svg { width: 26px; height: 26px; }
  #home-root .thumb.sa { background: #111827; } /* Self-Assessment */
  #home-root .thumb.tr { background: #10b981; } /* Training */
  #home-root .thumb.jb { background: #2563eb; } /* Job Board */
  #home-root .thumb.cv { background: #7c3aed; } /* CV Builder */

  /* ===== LATEST REVIEW (unchanged) ===== */
  #home-root .review-card { border: 1px solid var(--border,#e5e7eb); border-radius: 14px; background:#fff; padding: 14px; }
  #home-root .review-card h3 { margin: 0 0 .35rem 0; }
  #home-root .review-meta { color:#6b7280; font-size:.9rem; margin-bottom:.35rem; }
  #home-root .review-grid { display:grid; gap:.5rem; }
  #home-root .review-grid p { margin:.15rem 0; }
  #home-root .review-actions { margin-top:.5rem; display:flex; gap:.5rem; }

  /* ===== SKILLS SNAPSHOT — 2 rows of 3 (responsive fallbacks) ===== */
  #home-root .skills-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .75rem;
  }
  @media (max-width: 900px) {
    #home-root .skills-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 560px) {
    #home-root .skills-grid { grid-template-columns: 1fr; }
  }

  #home-root .skill {
    display: flex; align-items: center;
    padding: .6rem .75rem;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 14px; background: #fff;
  }
  #home-root .skill .icon {
    display: grid; place-items: center;
    width: 42px; height: 42px;
    border-radius: 12px;
    border: 1px solid var(--border, #e5e7eb);
    background: var(--panel, #fff);
    margin-right: .75rem; flex: 0 0 auto;
  }
  #home-root .skill .icon svg { width: 24px; height: 24px; }
  #home-root .skill-info { display:flex; align-items:baseline; gap:.5rem; }
  #home-root .skill-name { font-weight:600; }
  #home-root .skill-score { color:#6b7280; }
</style>

<!-- HERO banner: photo + overlay graphic -->
<section class="hero" role="region" aria-label="Get work-ready">
  <div class="hero-bg">
    <img class="hero-overlay" src="/images/hero.svg" alt="" aria-hidden="true">
  </div>
</section>

<!-- Intro band with left aligned white text (scoped classes so globals can’t override) -->
<section class="intro-band" aria-label="Welcome">
  <div class="local-container">
    <h1 class="intro-title">Welcome, <%= user.full_name %></h1>
    <p class="intro-sub">Track your progress, complete training, and apply for jobs.</p>
  </div>
</section>

<section class="local-container quick-links" aria-label="Quick links" style="margin-top:1.0rem">
  <div class="grid four">
    <!-- Self-Assessment -->
    <a class="card-link" href="/self-assessment" aria-label="Go to Self-Assessment">
      <div class="card">
        <div class="thumb sa" aria-hidden="true">
          <!-- Clipboard-check -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 5h6M9 9h6"/>
            <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            <path d="M9 14l2 2 4-4"/>
          </svg>
        </div>
        <div>
          <h3>Self-Assessment</h3>
          <p class="muted">Rate your skills and see your progress.</p>
        </div>
      </div>
    </a>

    <!-- Training -->
    <a class="card-link" href="/training" aria-label="Go to Training">
      <div class="card">
        <div class="thumb tr" aria-hidden="true">
          <!-- Graduation cap -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7l9-4 9 4-9 4-9-4z"/>
            <path d="M21 10v4"/>
            <path d="M12 11v8"/>
            <path d="M6 12v3a6 6 0 0 0 12 0v-3"/>
          </svg>
        </div>
        <div>
          <h3>Training</h3>
          <p class="muted">Barista & Food Hygiene modules and more.</p>
        </div>
      </div>
    </a>

    <!-- Job Board -->
    <a class="card-link" href="/job-board" aria-label="Go to Job Board">
      <div class="card">
        <div class="thumb jb" aria-hidden="true">
          <!-- Briefcase -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
            <path d="M9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"/>
            <path d="M3 13h18"/>
          </svg>
        </div>
        <div>
          <h3>Job Board</h3>
          <p class="muted">Browse and apply for jobs.</p>
        </div>
      </div>
    </a>

    <!-- CV Builder -->
    <a class="card-link" href="/cv-builder" aria-label="Go to CV Builder">
      <div class="card">
        <div class="thumb cv" aria-hidden="true">
          <!-- File-text -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6"/>
            <path d="M8 13h8M8 17h6"/>
          </svg>
        </div>
        <div>
          <h3>CV Builder</h3>
          <p class="muted">Build and download your CV.</p>
        </div>
      </div>
    </a>
  </div>
</section>

<!-- Latest Review summary card -->
<% if (typeof latestReview !== 'undefined' && latestReview) { %>
<section class="local-container" aria-label="Latest review" style="margin-top:1rem">
  <div class="review-card">
    <h3>Latest review – <%= latestReview.term %></h3>
    <div class="review-meta">Saved <%= latestReview.created_at %></div>
    <div class="review-grid">
      <% if (latestReview.reflection) { %>
        <p><strong>Reflection:</strong> <%= latestReview.reflection %></p>
      <% } %>
      <% if (latestReview.target) { %>
        <p><strong>Target:</strong> <%= latestReview.target %></p>
      <% } %>
      <% if (latestReview.staff_comment) { %>
        <p><strong>Staff comment:</strong> <%= latestReview.staff_comment %></p>
      <% } else { %>
        <p class="muted">No staff comment has been added yet for this review.</p>
      <% } %>
    </div>
    <div class="review-actions">
      <a class="btn" href="/self-assessment">View or update Self-Assessment</a>
    </div>
  </div>
</section>
<% } %>

<section class="local-container narrow" aria-label="Latest self-assessment" style="margin-top:1.25rem">
  <h2>Your latest skills snapshot</h2>

  <%
  const ICONS = {
    'Timekeeping': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 13V9M12 13l3 2" />
        <path d="M9 3h6" />
      </svg>`,
    'Teamwork': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <path d="M3 19c0-3 3-5 5-5s5 2 5 5" />
        <path d="M11 19c0-3 3-5 5-5s5 2 5 5" />
      </svg>`,
    'Communication': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 5h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H10l-4 3v-3" />
      </svg>`,
    'Problem Solving': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 1 6 6c0 2.7-1.7 4.4-3 5.5V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.5C7.7 13.4 6 11.7 6 9a6 6 0 0 1 6-6Z" />
        <path d="M10 21h4" />
      </svg>`,
    'Following Instructions': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M9 4v2h6V4" />
        <path d="M8 10h8M8 14h8" />
      </svg>`,
    'Customer Service': `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <path d="M4 12v2a2 2 0 0 0 2 2h2" />
        <path d="M20 12v2a2 2 0 0 1-2 2h-3l-2 2" />
      </svg>`
  };
  %>

  <% if (skills && skills.length) { %>
    <div class="skills-grid">
      <% skills.forEach(s => { %>
        <div class="skill">
          <div class="icon" aria-hidden="true"><%- ICONS[s.name] || ICONS['Timekeeping'] %></div>
          <div class="skill-info">
            <span class="skill-name"><%= s.name %></span>
            <span class="skill-score"><%= s.score %>/5</span>
          </div>
        </div>
      <% }) %>
    </div>
    <p class="muted">Update scores in <a href="/self-assessment">Self-Assessment</a>.</p>
  <% } else { %>
    <p class="muted">No self-assessment yet. <a href="/self-assessment">Complete one now</a>.</p>
  <% } %>
</section>

</div><!-- /#home-root -->

<%- include('partials/footer.js') %>
