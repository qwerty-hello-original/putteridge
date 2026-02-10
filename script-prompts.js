// ========================= PROMPTS SYSTEM =========================

// Load prompts object
function loadPrompts() {
  return JSON.parse(localStorage.getItem("prompts") || "{}");
}

// Save prompts object
function savePrompts(prompts) {
  localStorage.setItem("prompts", JSON.stringify(prompts));
}

// ========================= ADMIN: USER DROPDOWN =========================
function renderPromptUsers() {
  if (!currentUser || currentUser.role !== "Admin") return;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const select = document.getElementById("prompt-user-select");
  select.innerHTML = "";

  users.forEach(u => {
    const opt = document.createElement("option");
    opt.value = u.username;
    opt.textContent = `${u.displayName || u.username} (${u.username})`;
    select.appendChild(opt);
  });
}

// ========================= ADMIN: RENDER SECTIONS =========================
function renderPromptSections() {
  if (!currentUser || currentUser.role !== "Admin") return;

  const container = document.getElementById("prompt-sections");
  const selectedUser = document.getElementById("prompt-user-select").value;
  const prompts = loadPrompts();

  container.innerHTML = "";

  if (!prompts[selectedUser]) {
    prompts[selectedUser] = {};
    savePrompts(prompts);
  }

  const sections = prompts[selectedUser];

  Object.keys(sections).forEach(sectionName => {
    const card = document.createElement("div");
    card.className = "prompt-section-card";

    card.innerHTML = `
      <div class="prompt-section-header">
        <div class="prompt-section-title">${sectionName}</div>
        <div class="prompt-section-actions">
          <button onclick="addPromptSubsection('${sectionName}')">Add Sub</button>
          <button onclick="deletePromptSection('${sectionName}')">Delete</button>
        </div>
      </div>
      <div class="prompt-subsections" id="subs-${sectionName}"></div>
    `;

    container.appendChild(card);

    // Render sub-sections
    const subsContainer = document.getElementById(`subs-${sectionName}`);
    sections[sectionName].forEach(sub => {
      const subCard = document.createElement("div");
      subCard.className = "prompt-sub-card";

      subCard.innerHTML = `
        <div class="prompt-sub-card-icon"><i class="fas fa-circle"></i></div>
        <div class="prompt-sub-card-text">${sub}</div>
        <button class="prompt-sub-card-delete" onclick="deletePromptSubsection('${sectionName}', '${sub}')">
          <i class="fas fa-times"></i>
        </button>
      `;

      subsContainer.appendChild(subCard);
    });
  });
}

// ========================= ADMIN: ADD SECTION =========================
function addPromptSection() {
  const selectedUser = document.getElementById("prompt-user-select").value;
  const prompts = loadPrompts();

  const name = prompt("Section name:");
  if (!name) return;

  if (!prompts[selectedUser]) prompts[selectedUser] = {};
  if (prompts[selectedUser][name]) {
    alert("Section already exists.");
    return;
  }

  prompts[selectedUser][name] = [];
  savePrompts(prompts);
  renderPromptSections();
}

// ========================= ADMIN: ADD SUB-SECTION =========================
function addPromptSubsection(sectionName) {
  const selectedUser = document.getElementById("prompt-user-select").value;
  const prompts = loadPrompts();

  const sub = prompt("Sub-section text:");
  if (!sub) return;

  prompts[selectedUser][sectionName].push(sub);
  savePrompts(prompts);
  renderPromptSections();
}

// ========================= ADMIN: DELETE SECTION =========================
function deletePromptSection(sectionName) {
  const selectedUser = document.getElementById("prompt-user-select").value;
  const prompts = loadPrompts();

  if (!confirm(`Delete section "${sectionName}"?`)) return;

  delete prompts[selectedUser][sectionName];
  savePrompts(prompts);
  renderPromptSections();
}

// ========================= ADMIN: DELETE SUB-SECTION =========================
function deletePromptSubsection(sectionName, subName) {
  const selectedUser = document.getElementById("prompt-user-select").value;
  const prompts = loadPrompts();

  prompts[selectedUser][sectionName] =
    prompts[selectedUser][sectionName].filter(s => s !== subName);

  savePrompts(prompts);
  renderPromptSections();
}

// ========================= USER VIEW: MY PROMPTS =========================
function renderUserPrompts() {
  if (!currentUser) return;

  const container = document.getElementById("my-prompts-container");
  const prompts = loadPrompts();
  const username = currentUser.username;

  container.innerHTML = "";

  if (!prompts[username]) return;

  const sections = prompts[username];

  Object.keys(sections).forEach(sectionName => {
    const card = document.createElement("div");
    card.className = "prompt-section-card";

    card.innerHTML = `
      <div class="prompt-section-header">
        <div class="prompt-section-title">${sectionName}</div>
      </div>
      <div class="prompt-subsections" id="my-subs-${sectionName}"></div>
    `;

    container.appendChild(card);

    const subsContainer = document.getElementById(`my-subs-${sectionName}`);
    sections[sectionName].forEach(sub => {
      const subCard = document.createElement("div");
      subCard.className = "prompt-sub-card";

      subCard.innerHTML = `
        <div class="prompt-sub-card-icon"><i class="fas fa-circle"></i></div>
        <div class="prompt-sub-card-text">${sub}</div>
      `;

      subsContainer.appendChild(subCard);
    });
  });
}
