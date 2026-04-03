const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

// 🔐 Get token
const token = localStorage.getItem("token");

// 🚫 Protect page (IMPORTANT)
if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {

  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

});

// Add expense
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
    "Authorization": token
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

// Show on UI
function showExpense(exp) {
  const li = document.createElement("li");

  li.textContent = `${exp.amount} - ${exp.description} - ${exp.category}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/delete-expense/${exp.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token   // 🔥 ADD THIS
      }
    });

    li.remove();
  });

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}

// Load old expenses
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/get-expenses", {
    headers: {
      "Authorization": token
    }
  });

  const data = await res.json();

  console.log("Fetched data:", data); // 🔥 debug

  if (res.status === 200) {   // ✅ FIXED
    expenseList.innerHTML = ""; // clear old

    data.forEach(exp => {
      showExpense(exp);
    });
  } else {
    alert(data.message);
  }
});
