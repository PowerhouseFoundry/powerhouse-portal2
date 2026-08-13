<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <title><%= title %> — Powerhouse Employability</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#24102f">
  <link rel="stylesheet" href="/styles.css">
</head>
<%
  const isStaff = (typeof staff !== 'undefined' && staff);
  const isUser  = (typeof user !== 'undefined' && user);
  const homeHref = isStaff ? '/staff/dashboard' : (isUser ? '/home' : '/');
  const shellClass = isStaff ? 'staff-shell' : (isUser ? 'learner-shell' : 'public-shell');
%>
<body class="<%= shellClass %>">
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="<%= homeHref %>" aria-label="Powerhouse Employability home">
      <span class="brand-mark"><img class="brand-logo" src="/images/powerhouse_logo.png" alt="" aria-hidden="true"></span>
      <span class="brand-copy">
        <strong>POWERHOUSE</strong>
        <small>EMPLOYABILITY PATHWAY</small>
      </span>
    </a>

    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-navigation">
      <span class="sr-only">Open menu</span>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>

    <nav class="main-nav" id="main-navigation" aria-label="Main navigation">
      <% if (isStaff) { %>
        <a class="nav-link <%= active==='dashboard' ? 'is-active' : '' %>" href="/staff/dashboard">Dashboard</a>
        <a class="nav-link <%= active==='admin' ? 'is-active' : '' %>" href="/staff/admin">Admin</a>
        <a class="nav-link <%= active==='jobs' ? 'is-active' : '' %>" href="/staff/jobs">Jobs</a>
        <a class="nav-link <%= active==='staff-training' ? 'is-active' : '' %>" href="/staff/training">Training</a>
        <form method="post" action="/staff/logout" class="nav-form">
          <button class="nav-link nav-logout" type="submit">Log out</button>
        </form>
      <% } else if (isUser) { %>
        <a class="nav-link <%= active==='home' ? 'is-active' : '' %>" href="/home">Dashboard</a>
        <a class="nav-link <%= active==='self' ? 'is-active' : '' %>" href="/self-assessment">My Progress</a>
        <a class="nav-link <%= active==='training' ? 'is-active' : '' %>" href="/training">Training</a>
        <a class="nav-link <%= active==='jobs' ? 'is-active' : '' %>" href="/job-board">Practice Jobs</a>
        <a class="nav-link nav-link-cv" href="https://cv-builder-hvl3.onrender.com/" target="_blank" rel="noopener noreferrer">Build My CV <span aria-hidden="true">↗</span></a>
        <form method="post" action="/logout" class="nav-form">
          <button class="nav-link nav-logout" type="submit">Log out</button>
        </form>
      <% } else { %>
        <a class="nav-link <%= title === 'Student Sign in' ? 'is-active' : '' %>" href="/login">Learner sign in</a>
        <a class="nav-link" href="/staff/login">Staff sign in</a>
      <% } %>
    </nav>
  </div>
</header>

<main class="site-main">
<script>
(function(){
  const button = document.querySelector('.nav-toggle');
  const nav = document.getElementById('main-navigation');
  if (!button || !nav) return;
  button.addEventListener('click', function(){
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('is-open', !open);
  });
})();
</script>
