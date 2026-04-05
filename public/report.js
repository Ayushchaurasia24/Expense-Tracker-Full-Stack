// ================= TOAST =================
function toast(msg, type = 'success') {
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

const catIcons = {
  Food: '🍔', Petrol: '⛽', Salary: '💼', Shopping: '🛍️'
};

// ================= AUTH =================
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

function parseJwt(t) { return JSON.parse(atob(t.split('.')[1])); }
const user = parseJwt(token);

// ================= STATE =================
let allExpenses = [];
let currentFilter = "all";

// ================= PREMIUM CHECK =================
if (!user.isPremium) {
  document.getElementById("premiumGate").style.display = "block";
} else {
  document.getElementById("controls").style.display = "flex";
  document.getElementById("summaryRow").style.display = "grid";
  document.getElementById("listCard").style.display = "block";
  loadExpenses();
}

// ================= LOAD =================
async function loadExpenses() {
  try {
    const res = await fetch("http://localhost:3000/get-expenses", {
      headers: { Authorization: token }
    });
    const data = await res.json();
    allExpenses = Array.isArray(data) ? data : (data.expenses || []);
    display();
  } catch (err) {
    console.error(err);
    toast("Failed to load expenses", "error");
  }
}

// ================= DISPLAY WITH FILTER =================
function display() {
  const now = new Date();

  const filtered = allExpenses.filter(exp => {
    const date = new Date(exp.createdAt);

    if (currentFilter === "daily") {
      return date.toDateString() === now.toDateString();
    }
    if (currentFilter === "weekly") {
      return (now - date) / (1000 * 60 * 60 * 24) <= 7;
    }
    if (currentFilter === "monthly") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true; // all
  });

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);
  const avg   = filtered.length ? total / filtered.length : 0;

  document.getElementById("rStatTotal").textContent  = `₹${total.toLocaleString()}`;
  document.getElementById("rStatCount").textContent  = filtered.length;
  document.getElementById("rStatAvg").textContent    = `₹${avg.toFixed(0)}`;
  document.getElementById("countBadge").textContent  = `${filtered.length} item${filtered.length !== 1 ? 's' : ''}`;

  const list = document.getElementById("reportList");
  list.innerHTML = "";

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p>No expenses found for this period.</p>
      </div>`;
    return;
  }

  filtered.forEach(exp => {
    const div = document.createElement("div");
    div.className = "report-item";
    const icon = catIcons[exp.category] || '💰';
    const date = new Date(exp.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    div.innerHTML = `
      <div class="rep-left">
        <div class="cat-icon">${icon}</div>
        <div>
          <div class="rep-desc">${exp.description}</div>
          <div class="rep-meta">${exp.category} · ${date}</div>
        </div>
      </div>
      <div class="rep-amount">₹${Number(exp.amount).toLocaleString()}</div>
    `;
    list.appendChild(div);
  });
}

// ================= FILTER PILLS =================
document.querySelectorAll(".pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
    pill.classList.add("active");
    currentFilter = pill.dataset.val;
    display();
  });
});

// ================= DOWNLOAD =================
document.getElementById("downloadBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3000/get-expenses", {
      headers: { Authorization: token }
    });
    const data = await res.json();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `expenses_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast("Report downloaded!", "success");
  } catch (err) {
    console.error(err);
    toast("Download failed", "error");
  }
});
