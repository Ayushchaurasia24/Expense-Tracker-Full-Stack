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

// ================= CATEGORY ICONS =================
const catIcons = {
  Food:     '🍔',
  Petrol:   '⛽',
  Salary:   '💼',
  Shopping: '🛍️',
};

// ================= AUTH =================
const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const decodeToken = (t) => JSON.parse(atob(t.split(".")[1]));
const user = decodeToken(token);

// ================= STATE =================
let currentPage = 1;
let limit = parseInt(localStorage.getItem("limit") || "10");
let allExpenses = [];

// ================= STATS =================
function updateStats(expenses) {
  const now = new Date();
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, e) => s + Number(e.amount), 0);

  document.getElementById('statTotal').textContent = `₹${total.toLocaleString()}`;
  document.getElementById('statMonth').textContent = `₹${thisMonth.toLocaleString()}`;
  document.getElementById('statCount').textContent = expenses.length;
}

// ================= LOAD EXPENSES =================
async function loadExpenses(page = 1) {
  try {
    const res = await fetch(
      `http://localhost:3000/get-expenses?page=${page}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();

    allExpenses = data.expenses || [];
    renderExpenses(allExpenses);

    document.getElementById("pageInfo").textContent =
      `Page ${data.currentPage} of ${data.lastPage}`;

    document.getElementById("prevBtn").disabled = !data.hasPreviousPage;
    document.getElementById("nextBtn").disabled = !data.hasNextPage;

    currentPage = data.currentPage;

    updateStats(allExpenses);

  } catch (err) {
    console.error(err);
    toast("Failed to load expenses", "error");
  }
}

// ================= RENDER =================
function renderExpenses(expenses) {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  if (expenses.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🧾</div>
        <p>No expenses yet. Add your first one above!</p>
      </div>`;
    return;
  }

  expenses.forEach(exp => {
    const div = document.createElement("div");
    div.className = "expense-item";

    const icon = catIcons[exp.category] || '💰';
    const date = new Date(exp.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    div.innerHTML = `
      <div class="exp-left">
        <div class="cat-icon">${icon}</div>
        <div class="exp-info">
          <div class="exp-desc">${exp.description}</div>
          <div class="exp-meta">${exp.category} · ${date}${exp.note ? ' · ' + exp.note : ''}</div>
        </div>
      </div>
      <div class="exp-right">
        <div class="exp-amount">
          ₹${Number(exp.amount).toLocaleString()}
        </div>
      </div>
    `;

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", async () => {
      delBtn.disabled = true;
      delBtn.textContent = "…";
      await fetch(`http://localhost:3000/delete-expense/${exp.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      toast("Expense deleted", "info");
      loadExpenses(currentPage);
    });

    div.querySelector('.exp-right').appendChild(delBtn);
    list.appendChild(div);
  });
}

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", async () => {

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // Limit select
  const limitSelect = document.getElementById("limitSelect");
  limitSelect.value = limit;
  limitSelect.addEventListener("change", (e) => {
    limit = parseInt(e.target.value);
    localStorage.setItem("limit", limit);
    loadExpenses(1);
  });

  // Premium UI
  if (user.isPremium) {
    document.getElementById("premiumBanner").classList.add("show");
    const premBtn = document.getElementById("buyPremiumBtn");
    premBtn.textContent = "🌟 Premium";
    premBtn.disabled = true;

    // Leaderboard
    const lbSection = document.getElementById("leaderboardSection");
    lbSection.classList.add("show");

    try {
      const res = await fetch("http://localhost:3000/leaderboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const lbList = document.getElementById("leaderboardList");
      lbList.innerHTML = "";
      data.forEach((u, i) => {
        const div = document.createElement("div");
        div.className = "lb-item";
        div.innerHTML = `
          <span class="lb-rank">${i + 1}</span>
          <span class="lb-name">${u.name}</span>
          <span class="lb-amt">₹${Number(u.totalExpense).toLocaleString()}</span>
        `;
        lbList.appendChild(div);
      });
    } catch (e) { console.error(e); }
  }

  // Premium buy
  document.getElementById("buyPremiumBtn").addEventListener("click", async () => {
    if (user.isPremium) return;
    try {
      const res = await fetch("http://localhost:3000/pay", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const statusRes = await fetch(
        `http://localhost:3000/payment-status/${data.orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statusData = await statusRes.json();

      if (statusData.status === "SUCCESSFUL") {
        localStorage.setItem("token", statusData.token);
        toast("Upgraded to Premium! 🎉", "success");
        setTimeout(() => location.reload(), 1200);
      }
    } catch (err) {
      console.error(err);
      toast("Payment error", "error");
    }
  });

  loadExpenses();
});

// ================= ADD EXPENSE =================
const form  = document.getElementById("expenseForm");
const addBtn = document.getElementById("addBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    amount:      document.getElementById("amount").value,
    description: document.getElementById("description").value.trim(),
    category:    document.getElementById("category").value,
    note:        document.getElementById("note").value.trim()
  };

  addBtn.classList.add("btn-loading");
  addBtn.disabled = true;

  const res = await fetch("http://localhost:3000/add-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expense)
  });

  if (res.status === 201) {
    toast("Expense added!", "success");
    form.reset();
    loadExpenses(currentPage);
  } else {
    toast("Failed to add expense", "error");
  }

  addBtn.classList.remove("btn-loading");
  addBtn.disabled = false;
});

// ================= PAGINATION =================
document.getElementById("prevBtn").addEventListener("click", () => loadExpenses(currentPage - 1));
document.getElementById("nextBtn").addEventListener("click", () => loadExpenses(currentPage + 1));
