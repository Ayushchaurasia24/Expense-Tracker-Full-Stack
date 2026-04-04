const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

// 🔐 Get token
const token = localStorage.getItem("token");

// 🚫 Protect page
if (!token) {
  window.location.href = "login.html";
}

// Logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
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
      "Authorization": `Bearer ${token}`   // ✅ FIXED
    },
    body: JSON.stringify(expense)
  });

  const data = await res.json();

  if (res.status === 201) {
    showExpense(data);
  } else {
    alert(data.message);
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
        "Authorization": `Bearer ${token}`   // ✅ FIXED
      }
    });

    li.remove();
  });

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}

// ================== LOAD EXPENSES ==================
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/get-expenses", {
    headers: {
      "Authorization": `Bearer ${token}`   // ✅ FIXED
    }
  });

  const data = await res.json();

  console.log("Fetched data:", data);

  if (res.status === 200) {
    expenseList.innerHTML = "";

    data.forEach(exp => {
      showExpense(exp);
    });
  } else {
    alert(data.message);
  }
});

// ================== PREMIUM ==================
document.addEventListener("DOMContentLoaded", () => {

  const premiumBtn = document.getElementById("buyPremiumBtn");

  premiumBtn.addEventListener("click", async () => {
    try {
      // 🔹 Step 1: Create Order
      const res = await fetch("http://localhost:3000/pay", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`   // ✅ FIXED
        }
      });

      const data = await res.json();
      const orderId = data.orderId;

      alert("Payment Started: " + orderId);

      // 🔹 Step 2: Simulate Payment Popup
      const isSuccess = confirm("Simulate Payment?\nOK = Success\nCancel = Failed");

      // 🔹 Step 3: Check Status
      const statusRes = await fetch(
        `http://localhost:3000/payment-status/${orderId}`,
        {
          headers: {
            "Authorization": `Bearer ${token}`   // ✅ FIXED
          }
        }
      );

      const statusData = await statusRes.json();

      if (statusData.status === "SUCCESSFUL") {
        alert("🎉 Transaction successful! You are now Premium");

        // 🔥 UI update
        premiumBtn.innerText = "Premium User";
        premiumBtn.disabled = true;
      } else {
        alert("❌ Transaction failed");
      }

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  });

});