<% const title = 'Dashboard'; const active = 'home'; %>
<%- include('partials/header.js', { title, active, user }) %>

<%
  const ratedSkills = (skills || []).filter(s => Number(s.score) > 0);
  const averageScore = ratedSkills.length
    ? ratedSkills.reduce((sum, s) => sum + Number(s.score || 0), 0) / ratedSkills.length
    : 0;
  const progressPercent = Math.round((averageScore / 5) * 100);
  const sortedSkills = [...ratedSkills].sort((a,b) => Number(b.score || 0) - Number(a.score || 0));
  const strongest = sortedSkills.length ? sortedSkills[0] : null;
  const stageText = ratedSkills.length ? 'Building workplace skills' : 'Ready to get started';

  const levelText = (score) => {
    const n = Number(score || 0);
    if (!n) return 'Not rated';
    if (n === 1) return 'Starting';
    if (n === 2) return 'Building';
    if (n === 3) return 'Developing';
    if (n === 4) return 'Strong';
    return 'Confident';
  };

  const ICONS = {
    'Timekeeping': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 13V9M12 13l3 2M9 3h6"/></svg>',
    'Teamwork': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 19c0-3 3-5 5-5s5 2 5 5M11 19c0-3 3-5 5-5s5 2 5 5"/></svg>',
    'Communication': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H10l-4 3v-3"/></svg>',
    'Problem Solving': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 1 6 6c0 2.7-1.7 4.4-3 5.5V18a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-3.5C7.7 13.4 6 11.7 6 9a6 6 0 0 1 6-6Z"/><path d="M10 21h4"/></svg>',
    'Following Instructions': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M9 4v2h6V4M8 10h8M8 14h8"/></svg>',
    'Customer Service': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 16 0M4 12v2a2 2 0 0 0 2 2h2M20 12v2a2 2 0 0 1-2 2h-3l-2 2"/></svg>'
  };
%>

<div class="dashboard-page">
  <section class="dashboard-hero">
    <div class="dashboard-hero-copy">
      <span class="eyebrow eyebrow-light">MY EMPLOYABILITY PATHWAY</span>
      <h1>Welcome back, <%= user.full_name %></h1>
      <p>Keep building the skills, confidence and experience you need for the workplace.</p>
      <div class="hero-actions">
        <a class="btn btn-lime" href="/self-assessment">View my progress</a>
        <a class="btn btn-ghost-light" href="/training">Continue training</a>
      </div>
    </div>
    <div class="dashboard-hero-status">
      <span class="status-dot" aria-hidden="true"></span>
      <div>
        <small>PATHWAY STAGE</small>
        <strong><%= stageText %></strong>
      </div>
    </div>
  </section>

  <section class="dashboard-summary" aria-label="Progress summary">
    <article class="summary-card summary-progress">
      <div>
        <span class="eyebrow">OVERALL SKILLS SNAPSHOT</span>
        <strong class="summary-number"><%= ratedSkills.length ? progressPercent + '%' : '—' %></strong>
        <span class="summary-caption"><%= ratedSkills.length ? 'Based on your latest self-assessment' : 'Complete your first self-assessment' %></span>
      </div>
      <div class="progress-ring" style="--progress:<%= progressPercent %>" aria-label="Overall skills snapshot <%= progressPercent %> percent">
        <span><%= ratedSkills.length ? averageScore.toFixed(1) : '0' %><small>/5</small></span>
      </div>
    </article>

    <article class="summary-card">
      <span class="eyebrow">SKILLS RATED</span>
      <strong class="summary-number"><%= ratedSkills.length %><small>/6</small></strong>
      <span class="summary-caption">Your latest workplace skills check</span>
    </article>

    <article class="summary-card">
      <span class="eyebrow">CURRENT STRENGTH</span>
      <strong class="summary-text"><%= strongest ? strongest.name : 'Start your assessment' %></strong>
      <span class="summary-caption"><%= strongest ? strongest.score + '/5 · ' + levelText(strongest.score) : 'We will show your strongest skill here' %></span>
    </article>

    <article class="summary-card">
      <span class="eyebrow">LATEST REVIEW</span>
      <strong class="summary-text"><%= latestReview && latestReview.term ? latestReview.term : 'Not yet completed' %></strong>
      <span class="summary-caption"><%= latestReview ? 'Your latest saved review' : 'Your first review will appear here' %></span>
    </article>
  </section>

  <div class="dashboard-grid">
    <section class="panel skills-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">MY PROGRESS</span>
          <h2>Workplace skills</h2>
        </div>
        <a class="text-link" href="/self-assessment">Full progress <span aria-hidden="true">→</span></a>
      </div>

      <% if (skills && skills.length) { %>
        <div class="premium-skills-grid">
          <% skills.forEach(s => { const score = Number(s.score || 0); const pct = score * 20; %>
            <article class="premium-skill-card">
              <div class="skill-card-top">
                <span class="skill-icon"><%- ICONS[s.name] || ICONS['Timekeeping'] %></span>
                <span class="skill-score-badge"><%= score ? score + '/5' : '—' %></span>
              </div>
              <h3><%= s.name %></h3>
              <div class="skill-level"><%= levelText(score) %></div>
              <div class="skill-progress" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="<%= score %>" aria-label="<%= s.name %> score <%= score %> out of 5">
                <span style="width:<%= pct %>%"></span>
              </div>
            </article>
          <% }) %>
        </div>
      <% } %>
    </section>

    <aside class="dashboard-side">
      <section class="panel target-panel">
        <span class="panel-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3M22 12h-3"/></svg>
        </span>
        <span class="eyebrow">MY CURRENT TARGET</span>
        <% if (latestReview && latestReview.target) { %>
          <p class="target-text"><%= latestReview.target %></p>
          <a class="text-link" href="/self-assessment">View review <span aria-hidden="true">→</span></a>
        <% } else { %>
          <p class="target-text">Add a clear target in your next self-assessment.</p>
          <a class="text-link" href="/self-assessment">Set a target <span aria-hidden="true">→</span></a>
        <% } %>
      </section>

      <section class="panel feedback-panel">
        <span class="eyebrow">RECENT STAFF FEEDBACK</span>
        <% if (latestReview && latestReview.staff_comment) { %>
          <blockquote>“<%= latestReview.staff_comment %>”</blockquote>
          <span class="feedback-meta"><%= latestReview.term || 'Latest review' %></span>
        <% } else { %>
          <p class="empty-copy">No staff feedback has been added to your latest review yet.</p>
        <% } %>
      </section>
    </aside>
  </div>

  <section class="tools-section" aria-label="Employability tools">
    <div class="section-heading">
      <div>
        <span class="eyebrow">YOUR TOOLS</span>
        <h2>What would you like to work on?</h2>
      </div>
    </div>

    <div class="tool-grid">
      <a class="tool-card" href="/self-assessment">
        <span class="tool-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="M9 4h6v3H9zM9 13l2 2 4-4"/></svg>
        </span>
        <span class="tool-copy"><strong>My Progress</strong><small>Review your skills, reflections and targets.</small></span>
        <span class="tool-arrow" aria-hidden="true">→</span>
      </a>

      <a class="tool-card" href="/training">
        <span class="tool-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M6 11v4c0 2 3 4 6 4s6-2 6-4v-4"/></svg>
        </span>
        <span class="tool-copy"><strong>Training</strong><small>Complete modules and use workplace resources.</small></span>
        <span class="tool-arrow" aria-hidden="true">→</span>
      </a>

      <a class="tool-card" href="/job-board">
        <span class="tool-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h18v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M9 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3M3 13h18"/></svg>
        </span>
        <span class="tool-copy"><strong>Practice Jobs</strong><small>Practise reading adverts and making applications.</small></span>
        <span class="tool-arrow" aria-hidden="true">→</span>
      </a>

      <a class="tool-card tool-card-featured" href="https://cv-builder-hvl3.onrender.com/" target="_blank" rel="noopener noreferrer">
        <span class="tool-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>
        </span>
        <span class="tool-copy"><strong>Build My CV</strong><small>Open the Powerhouse CV Builder in a new tab.</small></span>
        <span class="tool-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  </section>

  <div class="simulation-note">
    <span aria-hidden="true">i</span>
    <p><strong>Training environment:</strong> Practice Jobs and applications on this portal are for employability training.</p>
  </div>
</div>

<%- include('partials/footer.js') %>
