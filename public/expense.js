// ================= BASE URL =================
const BASE_URL = "/api"; // change later to EC2

// ❌ REMOVE THIS (IMPORTANT)
// const token = localStorage.getItem("token");

// ================= HELPER =================
function getToken() {
  return localStorage.getItem("token");
}

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
function getUser() {
  const token = getToken();
  if (!token) return null;
  return JSON.parse(atob(token.split(".")[1]));
}

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
    const res = await fetch(`${BASE_URL}/get-expenses?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

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

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "Delete";

    delBtn.addEventListener("click", async () => {
      delBtn.disabled = true;
      delBtn.textContent = "…";

      await fetch(`${BASE_URL}/delete-expense/${exp.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
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

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  const limitSelect = document.getElementById("limitSelect");
  limitSelect.value = limit;
  limitSelect.addEventListener("change", (e) => {
    limit = parseInt(e.target.value);
    localStorage.setItem("limit", limit);
    loadExpenses(1);
  });

  const currentUser = getUser();

  // ✅ LOAD TOTAL FOR ALL USERS
  loadTotal();   // 👈 MOVE HERE

  if (currentUser && currentUser.isPremium) {

    document.getElementById("premiumBanner").classList.add("show");

    const premBtn = document.getElementById("buyPremiumBtn");
    premBtn.textContent = "🌟 Premium";
    premBtn.disabled = true;

    const lbSection = document.getElementById("leaderboardSection");
    lbSection.classList.add("show");

    try {
      const res = await fetch(`${BASE_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const data = await res.json();
      const lbList = document.getElementById("leaderboardList");
      lbList.innerHTML = "";

      if (!Array.isArray(data)) {
        console.error("Leaderboard error:", data);
        return;
      }

      data.forEach((user, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
          <span>#${index + 1} ${user.name}</span>
          <span>₹${Number(user.totalExpense || 0).toLocaleString()}</span>
        `;

        if (user.id === currentUser.id) {
          li.style.fontWeight = "bold";
          li.style.color = "gold";
          li.style.background = "#fff3cd";
          li.style.borderRadius = "8px";
          li.style.padding = "6px";
        }

        lbList.appendChild(li);
      });

    } catch (e) {
      console.error(e);
    }
  }

// ================= TOTAL =================
async function loadTotal() {
  try {
    const res = await fetch(`/api/total-expense`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });

    const data = await res.json();

    document.getElementById('statTotal').textContent =
      `₹${Number(data.total).toLocaleString()}`;

  } catch (err) {
    console.error(err);
  }
}
// ================= BUY PREMIUM =================
document.getElementById("buyPremiumBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/purchase/create-order", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    const data = await res.json();

    const cashfree = Cashfree({
      mode: "sandbox"
    });

    cashfree.checkout({
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_modal"
    });

    setTimeout(async () => {
      const verifyRes = await fetch("/api/purchase/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ orderId: data.orderId })
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert("Premium Activated 🎉");
        location.reload();
      }

    }, 5000);

  } catch (err) {
    console.error(err);
  }
});

  const downloadBtn = document.getElementById("downloadBtn");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
      try {
        const res = await fetch(`${BASE_URL}/download`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        if (res.status === 401) {
          toast("Only Premium users can download", "error");
          return;
        }

        const data = await res.json();

        if (data.fileURL) {
          const a = document.createElement("a");
          a.href = data.fileURL;
          a.download = "expenses.txt";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          toast("Download started 📥", "success");
        }

      } catch (err) {
        console.error(err);
        toast("Download failed", "error");
      }
    });
  }

  loadExpenses();
});

// ================= ADD EXPENSE =================
const form = document.getElementById("expenseForm");
const addBtn = document.getElementById("addBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    amount: document.getElementById("amount").value,
    description: document.getElementById("description").value.trim(),
    category: document.getElementById("category").value,
    note: document.getElementById("note").value.trim()
  };

  addBtn.innerText = "Adding...";
  addBtn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/add-expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
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

  } catch (err) {
    console.error(err);
    toast("Error adding expense", "error");
  } finally {
    addBtn.innerText = "Add Expense";
    addBtn.disabled = false;
  }
});

// ================= PAGINATION =================
document.getElementById("prevBtn").addEventListener("click", () => loadExpenses(currentPage - 1));
document.getElementById("nextBtn").addEventListener("click", () => loadExpenses(currentPage + 1));