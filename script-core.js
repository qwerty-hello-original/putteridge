// ========================= CONSTANTS & GLOBALS =========================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Waheguru@1984";

let currentUser = null;

// ========================= INIT APP =========================
function initApp() {
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  if (!Array.isArray(users)) users = [];

  // Ensure default admin exists
  const adminExists = users.some(u => u.username === ADMIN_USERNAME);
  if (!adminExists) {
    users.push({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      displayName: "Admin",
      role: "Admin"
    });
  }
  localStorage.setItem("users", JSON.stringify(users));

  if (!localStorage.getItem("loginLogs")) {
    localStorage.setItem("loginLogs", JSON.stringify([]));
  }
  if (!localStorage.getItem("dailyCreds")) {
    localStorage.setItem("dailyCreds", JSON.stringify({}));
  }
  if (!localStorage.getItem("prompts")) {
    localStorage.setItem("prompts", JSON.stringify({}));
  }
}
initApp();

// ========================= LOGIN =========================
function handleLogin() {
  const u = document.getElementById("login-username").value.trim();
  const p = document.getElementById("login-password").value;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const match = users.find(user => user.username === u && user.password === p);

  if (!match) {
    alert("Incorrect username or password");
    return;
  }
  currentUser = match;
  logLogin(match);
  enterApp();
}

// ========================= LOG LOGIN =========================
function logLogin(user) {
  const logs = JSON.parse(localStorage.getItem("loginLogs") || "[]");
  const now = new Date();
  logs.push({
    username: user.username,
    displayName: user.displayName || "",
    datetime: now.toLocaleString(),
    browser: navigator.userAgent,
    os: navigator.platform,
    device: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop"
  });
  localStorage.setItem("loginLogs", JSON.stringify(logs));
}

// ========================= ENTER APP =========================
function enterApp() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  document.getElementById("profile-name").textContent =
    currentUser.displayName || currentUser.username;
  document.getElementById("profile-role").textContent =
    currentUser.role || "User";
  document.getElementById("welcome-name").textContent =
    currentUser.displayName || currentUser.username;

  // Show/hide admin-only items
  const isAdmin = currentUser.role === "Admin";
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "block" : "none";
  });

  // Animate header + cards
  const header = document.getElementById("main-header");
  header.classList.add("welcome-animate");
  setTimeout(() => {
    document.querySelectorAll(".card").forEach((card, idx) => {
      setTimeout(() => card.classList.add("card-animate"), idx * 80);
    });
  }, 200);

  generateDailyCredentials();
  updateHomeCards();
  renderUsers();
  renderLogs();
  renderHistory();
  setupMenu();
}

// ========================= MENU =========================
function setupMenu() {
  const items = document.querySelectorAll(".menu li[data-page]");
  items.forEach(li => {
    li.onclick = () => {
      items.forEach(i => i.classList.remove("active"));
      li.classList.add("active");
      const page = li.getAttribute("data-page");
      showPage(page);
    };
  });
}

function showPage(pageName) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const pageEl = document.getElementById("page-" + pageName);
  if (pageEl) pageEl.classList.add("active");

  if (pageName === "home") {
    updateHomeCards();
  } else if (pageName === "creds") {
    generateDailyCredentials();
  } else if (pageName === "history") {
    renderHistory();
  } else if (pageName === "users") {
    renderUsers();
  } else if (pageName === "logs") {
    renderLogs();
  }
}

// ========================= DAILY CREDENTIALS =========================
function randomString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generateDailyCredentials() {
  const today = new Date().toLocaleDateString();
  const saved = JSON.parse(localStorage.getItem("dailyCreds") || "{}");
  if (!saved[today]) {
    const username = randomString(6);
    const password = randomString(8);
    saved[today] = { username, password };
    localStorage.setItem("dailyCreds", JSON.stringify(saved));
  }
  const creds = saved[today];
  document.getElementById("today-username").textContent = creds.username;
  document.getElementById("today-password").textContent = creds.password;
}

// ========================= HISTORY =========================
function renderHistory() {
  const saved = JSON.parse(localStorage.getItem("dailyCreds") || "{}");
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  Object.keys(saved)
    .sort()
    .forEach(date => {
      const li = document.createElement("li");
      li.textContent = `${date} -> ${saved[date].username} / ${saved[date].password}`;
      list.appendChild(li);
    });
}

// ========================= HOME CARDS =========================
function updateHomeCards() {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const logs = JSON.parse(localStorage.getItem("loginLogs") || "[]");
  const daily = JSON.parse(localStorage.getItem("dailyCreds") || "{}");
  const today = new Date().toLocaleDateString();

  document.getElementById("card-total-users").textContent = users.length.toString();
  document.getElementById("card-log-count").textContent = logs.length.toString();

  const lastLog = logs.length ? logs[logs.length - 1].datetime : "-";
  document.getElementById("card-last-login").textContent = lastLog;

  if (daily[today]) {
    document.getElementById("card-today-creds").textContent =
      `${daily[today].username} / ${daily[today].password}`;
  } else {
    document.getElementById("card-today-creds").textContent = "-";
  }
}

// ========================= USERS (ADMIN) =========================
function addUser() {
  if (!currentUser || currentUser.role !== "Admin") {
    alert("Only admin can add users.");
    return;
  }
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;
  const displayName = document.getElementById("new-displayname").value.trim();
  const role = document.getElementById("new-role").value.trim();

  if (!username || !password) {
    alert("Username and password are required.");
    return;
  }
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    alert("User already exists.");
    return;
  }

  users.push({
    username,
    password,
    displayName: displayName || username,
    role: role || "User"
  });

  localStorage.setItem("users", JSON.stringify(users));

  document.getElementById("new-username").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("new-displayname").value = "";
  document.getElementById("new-role").value = "";

  renderUsers();
  updateHomeCards();
}

function renderUsers() {
  if (!currentUser || currentUser.role !== "Admin") return;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const tbody = document.getElementById("users-table-body");
  tbody.innerHTML = "";

  users.forEach(u => {
    const tr = document.createElement("tr");
    const isAdminUser = (u.username === ADMIN_USERNAME);
    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${u.displayName || ""}</td>
      <td>${u.role || ""}</td>
      <td>${u.password}</td>
      <td>
        <button onclick="editUser('${u.username}')">Edit</button>
        ${isAdminUser ? "" : `<button onclick="deleteUser('${u.username}')">Delete</button>`}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteUser(username) {
  if (!currentUser || currentUser.role !== "Admin") return;
  if (username === ADMIN_USERNAME) {
    alert("You cannot delete the default admin user.");
    return;
  }
  let users = JSON.parse(localStorage.getItem("users") || "[]");
  users = users.filter(u => u.username !== username);
  localStorage.setItem("users", JSON.stringify(users));

  renderUsers();
  updateHomeCards();
}

function editUser(username) {
  if (!currentUser || currentUser.role !== "Admin") return;

  let users = JSON.parse(localStorage.getItem("users") || "[]");
  const idx = users.findIndex(u => u.username === username);
  if (idx === -1) return;
  const user = users[idx];

  const newDisplayName = prompt("Display Name:", user.displayName || "");
  if (newDisplayName === null) return;
  const newRole = prompt("Role:", user.role || "");
  if (newRole === null) return;

  user.displayName = newDisplayName.trim() || user.username;
  user.role = newRole.trim() || "User";

  users[idx] = user;
  localStorage.setItem("users", JSON.stringify(users));

  if (currentUser.username === username) {
    currentUser = user;
    document.getElementById("profile-name").textContent = currentUser.displayName;
    document.getElementById("profile-role").textContent = currentUser.role;
    document.getElementById("welcome-name").textContent = currentUser.displayName;
  }

  renderUsers();
}

// ========================= LOGS (ADMIN) =========================
function renderLogs() {
  if (!currentUser || currentUser.role !== "Admin") return;

  const logs = JSON.parse(localStorage.getItem("loginLogs") || "[]");
  const tbody = document.getElementById("logs-table-body");
  tbody.innerHTML = "";

  logs.slice().reverse().forEach(log => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.username}</td>
      <td>${log.displayName || ""}</td>
      <td>${log.datetime}</td>
      <td>${log.browser}</td>
      <td>${log.os}</td>
      <td>${log.device}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ========================= LOGOUT =========================
function logout() {
  currentUser = null;
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("login-username").value = "";
  document.getElementById("login-password").value = "";
}
