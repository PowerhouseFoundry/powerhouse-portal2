<% const title = 'CV Builder'; const active = 'cv'; %>
<%- include('partials/header.js', { title, active, user }) %>

<div id="cv-root">
  <style>
    /* ===== Page-scoped styling so globals don't clash ===== */
    #cv-root .wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
    #cv-root h1 { margin: .25rem 0 1rem 0; }
    #cv-root h2 { margin: 1rem 0 .5rem 0; font-size: 1.1rem; }

    #cv-root .card {
      background: #fff; border: 1px solid var(--border,#e5e7eb); border-radius: 16px;
      padding: 16px; box-shadow: 0 1px 0 rgba(0,0,0,.02);
    }
    #cv-root .subcard {
      background: #fff; border: 1px solid var(--border,#e5e7eb); border-radius: 12px;
      padding: 12px; display: grid; gap: 8px;
    }

    /* Form grid */
    #cv-root .grid { display: grid; gap: 12px; }
    #cv-root .one   { grid-template-columns: 1fr; }
    #cv-root .two   { grid-template-columns: repeat(2, 1fr); }
    #cv-root .three { grid-template-columns: repeat(3, 1fr); }

    @media (max-width: 960px) { #cv-root .two, #cv-root .three { grid-template-columns: 1fr; } }

    /* Inputs */
    #cv-root label { font-weight: 600; display: block; margin-bottom: 2px; }
    #cv-root input[type="text"],
    #cv-root input[type="email"],
    #cv-root textarea {
      width: 100%;
      border: 1px solid var(--border,#d1d5db);
      background: #fff;
      border-radius: 10px;
      padding: 10px 12px;
      font: inherit;
      line-height: 1.3;
      box-sizing: border-box;
    }
    #cv-root textarea { resize: vertical; min-height: 110px; }
    #cv-root .tight { min-height: 80px; }

    /* Sentence starters */
    #cv-root .starter-row { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:8px; }
    #cv-root .btn.ghost {
      background: #fff;
      border: 1px solid var(--border,#d1d5db);
      color: #111 !important;     /* always visible */
      font-weight: 500;
    }
    #cv-root .btn.ghost:hover {
      border-color: #10b981;
      color: #10b981 !important;
    }

    /* Actions */
    #cv-root .actions { display:flex; gap:.5rem; align-items:center; flex-wrap:wrap; }
    #cv-root .actions .spacer { flex:1 1 auto; }

    /* Buttons (page overrides) */
    #cv-root .btn {
      padding: 10px 14px; border-radius: 12px; border: 1px solid transparent; cursor: pointer;
      font: inherit;
    }
    #cv-root .btn.danger { border-color: #ef4444; color:#ef4444; background:#fff; }
    #cv-root .btn.danger:hover { background:#fee2e2; }

    /* Help text */
    #cv-root .muted { color:#6b7280; font-size:.95rem; }
  </style>

  <div class="wrap">
    <h1>CV Builder</h1>

    <div class="card">
      <!-- Save details form -->
      <form method="post" action="/cv-builder" autocomplete="off" novalidate>
        <!-- Contact details -->
        <div class="grid two">
          <div>
            <label>Full name</label>
            <input type="text" name="full_name" value="<%= data.full_name || '' %>" placeholder="e.g. Alex Taylor" required>
          </div>
          <div>
            <label>Address</label>
            <input type="text" name="address" value="<%= data.address || '' %>" placeholder="e.g. 123 Street, Leeds, LS1 1AA">
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" value="<%= data.email || '' %>" placeholder="e.g. alex.taylor@email.com">
          </div>
          <div>
            <label>Phone</label>
            <input type="text" name="phone" value="<%= data.phone || '' %>" placeholder="e.g. 07123 456789">
          </div>
        </div>

        <!-- Personal statement + starters -->
        <div class="grid one" style="margin-top:.75rem">
          <div>
            <label>Personal statement</label>
            <textarea name="personal_statement" rows="5" placeholder="A short summary of who you are and what you offer."><%= data.personal_statement || '' %></textarea>

            <!-- Sentence starters: 2 rows of 4 -->
            <div class="starter-row" style="margin-top:.5rem">
              <button type="button" class="btn ghost" onclick="insertPS('I am a reliable and motivated individual with a strong interest in working in...')">Reliable & motivated</button>
              <button type="button" class="btn ghost" onclick="insertPS('Through my experience at The Powerhouse, I have developed strengths in...')">Strengths from Powerhouse</button>
              <button type="button" class="btn ghost" onclick="insertPS('I am keen to learn and develop my skills in...')">Keen to learn</button>
              <button type="button" class="btn ghost" onclick="insertPS('I like working as part of a team and helping others.')">Teamwork & helping others</button>
            </div>
            <div class="starter-row" style="margin-top:.5rem">
              <button type="button" class="btn ghost" onclick="insertPS('I can listen carefully and follow instructions to a high standard.')">Listening & following instructions</button>
              <button type="button" class="btn ghost" onclick="insertPS('I can work independently when needed and stay focused on tasks.')">Independent & focused</button>
              <button type="button" class="btn ghost" onclick="insertPS('My goal is to build a career in... and I am ready to start in an entry-level role.')">Career goal</button>
              <button type="button" class="btn ghost" onclick="insertPS('I am looking forward to gaining more experience in the workplace.')">Gain experience</button>
            </div>
          </div>

          <div>
            <label>Key skills (one per line)</label>
            <textarea name="skills" rows="4" class="tight" placeholder="e.g. Customer service&#10;Timekeeping&#10;Following instructions"><%= data.skills || '' %></textarea>
          </div>
        </div>

        <!-- Education -->
        <h2>Education</h2>
        <div class="grid three">
          <% for (let i = 0; i < 3; i++) {
               const e = (data.education && data.education[i]) || {};
          %>
            <div class="subcard">
              <label>Qualification</label>
              <input type="text" name="edu_qualification_<%= i %>" value="<%= e.qualification || '' %>" placeholder="e.g. Entry Level 3 English">
              <label>Institution</label>
              <input type="text" name="edu_institution_<%= i %>" value="<%= e.institution || '' %>" placeholder="e.g. West SILC">
              <label>Dates</label>
              <input type="text" name="edu_dates_<%= i %>" value="<%= e.dates || '' %>" placeholder="e.g. 2022–2024">
            </div>
          <% } %>
        </div>

        <!-- Work Experience -->
        <h2>Work Experience</h2>
        <div class="grid three">
          <% for (let i = 0; i < 3; i++) {
               const w = (data.work && data.work[i]) || {};
          %>
            <div class="subcard">
              <label>Role</label>
              <input type="text" name="work_role_<%= i %>" value="<%= w.role || '' %>" placeholder="e.g. Barista Volunteer">
              <label>Employer</label>
              <input type="text" name="work_employer_<%= i %>" value="<%= w.employer || '' %>" placeholder="e.g. The Powerhouse Café">
              <label>Dates</label>
              <input type="text" name="work_dates_<%= i %>" value="<%= w.dates || '' %>" placeholder="e.g. Jan–Mar 2024">
              <label>Details</label>
              <textarea name="work_details_<%= i %>" rows="3" placeholder="e.g. Prepared hot drinks, handled payments, kept the work area clean."><%= w.details || '' %></textarea>
            </div>
          <% } %>
        </div>

  <!-- Actions row -->
<div class="actions" style="margin-top:1rem">
  <!-- Save to /cv-builder (default action of the form) -->
  <button type="submit" class="btn">Save Details</button>

  <!-- Download CV: submit same form to /cv-builder/build-doc -->
  <button
    type="submit"
    class="btn ghost"
    formaction="/cv-builder/build-doc"
    formmethod="post"
  >
    Download CV
  </button>

  <span class="spacer"></span>

  <!-- Start New CV: submit same form to /cv-builder/reset -->
  <button
    type="submit"
    class="btn danger ghost"
    formaction="/cv-builder/reset"
    formmethod="post"
  >
    Start New CV
  </button>
</div>


    <p class="muted" style="margin-top:.5rem">Tip: click a sentence starter to add it to your personal statement, then edit to make it your own.</p>
  </div>
</div>

<script>
  function insertPS(text){
    const ta = document.querySelector('#cv-root textarea[name="personal_statement"]');
    if (!ta) return;
    const sep = ta.value && !ta.value.endsWith("\n") ? "\n" : "";
    ta.value = (ta.value || "") + sep + text;
    ta.focus();
  }
</script>

<%- include('partials/footer.js') %>
