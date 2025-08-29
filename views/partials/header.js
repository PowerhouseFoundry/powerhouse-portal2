<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title><%= title %> — The Powerhouse</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
<%
  // Don’t break student pages if staff isn’t passed
  const isStaff = (typeof staff !== 'undefined' && staff);
  const isUser  = (typeof user  !== 'undefined' && user);
  const homeHref = isStaff ? '/staff/dashboard' : (isUser ? '/home' : '/');
%>

<header class="site-header header-powerhouse">
  <div class="container header-inner">
    <a class="brand" href="<%= homeHref %>">
      <img class="brand-logo" src="/images/powerhouse_logo.png" alt="The Powerhouse logo" height="40">
      <span class="brand-text">The Powerhouse</span>
    </a>

    <nav class="main-nav">
      <% if (isStaff) { %>
        <!-- STAFF NAV -->
        <a class="btn nav-btn" href="/staff/dashboard" aria-current="<%= active==='dashboard' ? 'page' : false %>">Dashboard</a>
        <a class="btn nav-btn" href="/staff/admin" aria-current="<%= active==='admin' ? 'page' : false %>">Admin</a>
        <a class="btn nav-btn" href="/staff/jobs" aria-current="<%= active==='jobs' ? 'page' : false %>">Jobs</a>
        <a class="btn nav-btn" href="/staff/training" aria-current="<%= active==='staff-training' ? 'page' : false %>">Training</a>
        <form method="post" action="/staff/logout" style="display:inline">
          <button class="btn nav-btn outline" type="submit">Logout</button>
        </form>
      <% } else if (isUser) { %>
        <!-- STUDENT NAV -->
        <a class="btn nav-btn" href="/home" aria-current="<%= active==='home' ? 'page' : false %>">Home</a>
        <a class="btn nav-btn" href="/self-assessment" aria-current="<%= active==='self' ? 'page' : false %>">Self-Assessment</a>
        <a class="btn nav-btn" href="/training" aria-current="<%= active==='training' ? 'page' : false %>">Training</a>
        <a class="btn nav-btn" href="/job-board" aria-current="<%= active==='jobs' ? 'page' : false %>">Job Board</a>
        <a class="btn nav-btn" href="/cv-builder" aria-current="<%= active==='cv' ? 'page' : false %>">CV Builder</a>
        <form method="post" action="/logout" style="display:inline">
          <button class="btn nav-btn outline" type="submit">Logout</button>
        </form>
      <% } else { %>
        <!-- PUBLIC (login) -->
        <a class="btn nav-btn" href="/login">Student login</a>
        <a class="btn nav-btn" href="/staff/login">Staff login</a>
      <% } %>
    </nav>
  </div>
</header>

<main>
