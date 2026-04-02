const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  });

  const data = await res.json();

  showExpense(data);
});

// Show on UI
function showExpense(exp) {
  const li = document.createElement("li");

  li.textContent = `${exp.amount} - ${exp.description} - ${exp.category}`;

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";

  // IMPORTANT: Add click event
  deleteBtn.addEventListener("click", async () => {
    await fetch(`http://localhost:3000/delete-expense/${exp.id}`, {
      method: "DELETE"
    });

    li.remove(); // remove from UI
  });

  li.appendChild(deleteBtn);
  expenseList.appendChild(li);
}

// Load old expenses
window.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("http://localhost:3000/get-expenses");
  const data = await res.json();

  data.forEach(showExpense);
});