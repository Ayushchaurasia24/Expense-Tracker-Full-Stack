const token = localStorage.getItem("token");
const list = document.getElementById("reportList");
const filter = document.getElementById("filter");
const downloadBtn = document.getElementById("downloadBtn");

// 🔐 Decode JWT (simple)
function parseJwt(token) {
  return JSON.parse(atob(token.split('.')[1]));
}

const user = parseJwt(token);

// 🚫 Disable for non-premium
if (!user.isPremium) {
  downloadBtn.disabled = true;
  alert("Upgrade to premium to access reports");
}

// 📊 Load expenses
async function loadExpenses() {
  const res = await fetch("http://localhost:3000/get-expenses", {
    headers: { Authorization: token }
  });

  const data = await res.json();
  display(data);
}

// 🎯 Filter logic
function display(expenses) {
  list.innerHTML = "";

  const selected = filter.value;
  const now = new Date();

  const filtered = expenses.filter(exp => {
    const date = new Date(exp.createdAt);

    if (selected === "daily") {
      return date.toDateString() === now.toDateString();
    }

    if (selected === "weekly") {
      const diff = (now - date) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }

    if (selected === "monthly") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  filtered.forEach(exp => {
    const li = document.createElement("li");
    li.textContent = `${exp.amount} - ${exp.description} (${exp.category})`;
    list.appendChild(li);
  });
}

// 🔁 Filter change
filter.addEventListener("change", loadExpenses);

// 📥 Download (frontend only)
downloadBtn.addEventListener("click", async () => {
  const res = await fetch("http://localhost:3000/get-expenses", {
    headers: { Authorization: token }
  });

  const data = await res.json();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.json";
  a.click();
});

// 🚀 Init
loadExpenses();