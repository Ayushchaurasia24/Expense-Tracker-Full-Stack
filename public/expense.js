const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const decodeToken = (token) => {
  return JSON.parse(atob(token.split(".")[1]));
};

const user = decodeToken(token);

// 🔥 PAGINATION STATE
let currentPage = 1;
let limit = localStorage.getItem("limit") || 10;

// ================= LOAD EXPENSES =================
async function loadExpenses(page = 1) {
  try {
    const res = await fetch(
      `http://localhost:3000/get-expenses?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    expenseList.innerHTML = "";

    data.expenses.forEach(showExpense);

    // 🔥 Pagination UI
    document.getElementById("pageInfo").innerText =
      `Page ${data.currentPage} of ${data.lastPage}`;

    document.getElementById("prevBtn").disabled = !data.hasPreviousPage;
    document.getElementById("nextBtn").disabled = !data.hasNextPage;

    currentPage = data.currentPage;

  } catch (err) {
    console.log(err);
  }
}

// ================= DOM LOAD =================
document.addEventListener("DOMContentLoaded", async () => {

  const logoutBtn = document.getElementById("logoutBtn");
  const premiumBtn = document.getElementById("buyPremiumBtn");
  const limitSelect = document.getElementById("limitSelect");

  // 🔥 Set saved limit
  limitSelect.value = limit;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  // 🔥 PREMIUM UI
  if (user.isPremium) {
    document.getElementById("premiumMsg").textContent =
      "🌟 You are a premium user now";

    premiumBtn.innerText = "Premium User";
    premiumBtn.disabled = true;

    document.getElementById("leaderboardTitle").style.display = "block";

    const res = await fetch("http://localhost:3000/leaderboard", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const ul = document.getElementById("leaderboard");
    ul.innerHTML = "";

    data.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `${user.name} - ₹${user.totalExpense}`;
      ul.appendChild(li);
    });
  }

  // 🔥 Load initial expenses
  loadExpenses();

  // 🔥 LIMIT CHANGE (Dynamic Pagination)
  limitSelect.addEventListener("change", (e) => {
    limit = e.target.value;
    localStorage.setItem("limit", limit);

    loadExpenses(1); // reset to first page
  });

  // 🔹 Premium purchase
  premiumBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:3000/pay", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      const statusRes = await fetch(
        `http://localhost:3000/payment-status/${data.orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const statusData = await statusRes.json();

      if (statusData.status === "SUCCESSFUL") {
        localStorage.setItem("token", statusData.token);
        location.reload();
      }

    } catch (err) {
      console.log(err);
    }
  });
});

// ================= ADD EXPENSE =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const expense = {
    amount: document.getElementById("amount").value,
    description: document.getElementById("description").value,
    category: document.getElementById("category").value
  };

  const res = await fetch("http://localhost:3000/add-expense", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(expense)
  });

  if (res.status === 201) {
    loadExpenses(currentPage); // 🔥 refresh current page
  }
});

// ================= SHOW EXPENSE =================
function showExpense(exp) {
  const li = document.createElement("li");

  li.textContent = `${exp.amount} - ${exp.description} - ${exp.category}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/delete-expense/${exp.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    // 🔥 HANDLE EDGE CASE (empty page)
    loadExpenses(currentPage);
  });

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}

// ================= PAGINATION BUTTONS =================
document.getElementById("prevBtn").addEventListener("click", () => {
  loadExpenses(currentPage - 1);
});

document.getElementById("nextBtn").addEventListener("click", () => {
  loadExpenses(currentPage + 1);
});