<% const title = 'Student Sign in'; const active = ''; %>
<%- include('partials/header.js', { title, active, user: null, staff: null }) %>

<div class="login-page" aria-label="Learner sign in">
  <section class="login-shell">
    <div class="login-visual">
      <span class="eyebrow eyebrow-light">WEST SILC POWERHOUSE</span>
      <h1>Your employability journey, all in one place.</h1>
      <p>Check your progress, work on targets, complete training and practise workplace applications.</p>
    </div>

    <div class="login-form-panel">
      <span class="login-kicker">EMPLOYABILITY PATHWAY</span>
      <h2>Learner sign in</h2>
      <p class="login-lead">Sign in to continue your pathway.</p>

      <% if (typeof error !== 'undefined' && error) { %>
        <div class="error" role="alert"><%= error %></div>
      <% } %>

      <form method="post" action="/login" novalidate>
        <label class="field">
          <span class="label">Username</span>
          <input type="text" name="username" autocomplete="username" required>
        </label>

        <label class="field">
          <span class="label">Password</span>
          <input type="password" name="password" autocomplete="current-password" required>
        </label>

        <div class="login-actions">
          <button class="btn" type="submit">Sign in</button>
          <a class="staff-link" href="/staff/login">Staff sign in</a>
        </div>
      </form>
    </div>
  </section>
</div>

<%- include('partials/footer.js') %>
