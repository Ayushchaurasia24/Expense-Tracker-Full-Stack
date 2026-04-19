// ================= BASE URL =================
const BASE_URL = "/api";

// ================= TOAST =================
function toast(msg, type = 'success') {
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");
const loginBtn  = document.getElementById("loginBtn");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value
  };

  loginBtn.innerText = "Logging in...";
  loginBtn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails)
    });

    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem("token", data.token);
      toast("Login successful!", "success");

      setTimeout(() => {
        window.location.href = "expense.html";
      }, 800);

    } else {
      toast(data.message || "Login failed", "error");
    }

  } catch (err) {
    console.error(err);
    toast("Network error", "error");
  } finally {
    loginBtn.innerText = "Login";
    loginBtn.disabled = false;
  }
});

const forgotForm = document.getElementById("forgotForm");
const forgotBtn = document.getElementById("forgotBtn");

forgotForm.addEventListener("submit", async function (e) {
  e.preventDefault(); // ⚠️ prevents reload

  const email = document.getElementById("forgotEmail").value.trim();

  forgotBtn.innerText = "Sending...";
  forgotBtn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/password/forgotpassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.status === 200) {
      toast("Reset link sent to email!", "success");
    } else {
      toast(data.message || "Failed to send link", "error");
    }

  } catch (err) {
    console.error(err);
    toast("Network error", "error");
  } finally {
    forgotBtn.innerText = "Send Reset Link";
    forgotBtn.disabled = false;
  }
});

function toggleForgot() {
  const panel = document.getElementById("forgotPanel");

  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}