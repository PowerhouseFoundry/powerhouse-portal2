<% const title = 'Student Sign in'; const active = ''; %>
<%- include('partials/header.js', { title, active, user: null, staff: null }) %>

<div id="login-root" aria-label="Student sign in">
  <style>
    /* ===== Scoped styles so global CSS can't override ===== */
    #login-root * { box-sizing: border-box; }
    #login-root {
      min-height: calc(100vh - 120px);
      display: grid;
      place-items: center;
      padding: 24px 16px;
      background: #f8fafc;
    }
    #login-root .card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
    }
    #login-root .brand {
      display: flex; align-items: center; gap: 10px;
      justify-content: center;
      margin-bottom: 14px;
    }
    #login-root .brand img { height: 42px; }
    #login-root .brand-name { font-weight: 800; letter-spacing: .2px; color: #111827; }
    #login-root h1 { margin: 0 0 8px 0; text-align: center; font-size: 1.35rem; color: #111827; }
    #login-root p.lead { margin: 0 0 16px 0; text-align: center; color: #6b7280; font-size: .98rem; }

    #login-root .field { display: grid; gap: 6px; margin-bottom: 12px; }
    #login-root .label { font-weight: 600; color: #111827; }
    #login-root input[type="text"], #login-root input[type="password"] {
      width: 100%; border: 1px solid #e5e7eb; border-radius: 10px;
      padding: 10px 12px; background: #fff; line-height: 1.35; font: inherit; outline: none;
    }
    #login-root input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.12); }

    #login-root .error {
      background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;
      padding: 8px 10px; border-radius: 10px; margin-bottom: 12px; font-size: .95rem;
    }

    #login-root .actions { display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-top: 6px; }
    #login-root .btn {
      appearance: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      border: 1px solid #7c3aed; background: #7c3aed; color: #fff;
      padding: 10px 14px; border-radius: 12px; font-weight: 600; cursor: pointer; text-decoration: none;
      transition: background .15s ease, border-color .15s ease, transform .02s ease;
    }
    #login-root .btn:hover { background: #10b981; border-color: #10b981; }
    #login-root .btn:active { transform: translateY(1px); }
    #login-root .link { color: #7c3aed; text-decoration: none; font-weight: 600; }
    #login-root .link:hover { text-decoration: underline; }
  </style>

  <div class="card" role="form" aria-describedby="login-desc">
    <div class="brand">
      <img src="/images/powerhouse_logo.png" alt="Powerhouse logo" onerror="this.style.display='none'">
      <div class="brand-name">The Powerhouse</div>
    </div>

    <h1>Student sign in</h1>
    <p id="login-desc" class="lead">Log in to track progress, complete training, and apply for jobs.</p>

    <% if (typeof error !== 'undefined' && error) { %>
      <div class="error"><%= error %></div>
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

      <div class="actions">
        <button class="btn" type="submit">Sign in</button>
        <a class="link" href="/staff/login">Staff sign in</a>
      </div>
    </form>
  </div>
</div>

<%- include('partials/footer.js') %>
