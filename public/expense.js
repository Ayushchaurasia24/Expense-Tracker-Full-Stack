const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

// 🔐 Token
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

// 🔓 Decode token
const decodeToken = (token) => {
  return JSON.parse(atob(token.split(".")[1]));
};

const user = decodeToken(token);

// ================== DOM LOAD ==================
document.addEventListener("DOMContentLoaded", async () => {

  const logoutBtn = document.getElementById("logoutBtn");
  const premiumBtn = document.getElementById("buyPremiumBtn");

  // 🔹 Logout
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

    // 🔥 Leaderboard
    document.getElementById("leaderboardTitle").style.display = "block";

    const res = await fetch("http://localhost:3000/leaderboard", {
      headers: {
        Authorization: `Bearer ${token}`
      }
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

  // 🔹 Load Expenses
  const res = await fetch("http://localhost:3000/get-expenses", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (res.status === 200) {
    expenseList.innerHTML = "";
    data.forEach(showExpense);
  }

  // 🔹 Premium Button
  premiumBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:3000/pay", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      const orderId = data.orderId;

      const statusRes = await fetch(
        `http://localhost:3000/payment-status/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const statusData = await statusRes.json();

      if (statusData.status === "SUCCESSFUL") {
        alert("🎉 You are now Premium!");

        // 🔥 SAVE NEW TOKEN
        localStorage.setItem("token", statusData.token);

        location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  });

});

// ================== ADD EXPENSE ==================
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

  const data = await res.json();

  if (res.status === 201) {
    showExpense(data);
  }
});

// ================== SHOW EXPENSE ==================
function showExpense(exp) {
  const li = document.createElement("li");

  li.textContent = `${exp.amount} - ${exp.description} - ${exp.category}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/delete-expense/${exp.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    li.remove();
  });

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}