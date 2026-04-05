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

// ================= TOGGLE FORGOT PANEL =================
function toggleForgot() {
  const panel = document.getElementById('forgotPanel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");
const loginBtn  = document.getElementById("loginBtn");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    email:    document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value
  };

  loginBtn.classList.add("btn-loading");
  loginBtn.disabled = true;

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails)
    });

    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem("token", data.token);
      toast("Login successful! Redirecting…", "success");
      setTimeout(() => window.location.href = "expense.html", 1200);
    } else {
      toast(data.message || "Login failed", "error");
      loginBtn.classList.remove("btn-loading");
      loginBtn.disabled = false;
    }

  } catch (err) {
    console.error(err);
    toast("Network error. Please try again.", "error");
    loginBtn.classList.remove("btn-loading");
    loginBtn.disabled = false;
  }
});

// ================= FORGOT PASSWORD =================
const forgotForm = document.getElementById("forgotForm");
const forgotBtn  = document.getElementById("forgotBtn");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();

  forgotBtn.classList.add("btn-loading");
  forgotBtn.disabled = true;

  try {
    const res = await axios.post(
      "http://localhost:3000/password/forgotpassword",
      { email }
    );

    toast(res.data.message || "Reset link sent!", "success");
    forgotBtn.classList.remove("btn-loading");
    forgotBtn.disabled = false;

  } catch (err) {
    console.error(err);
    toast("Error sending reset email.", "error");
    forgotBtn.classList.remove("btn-loading");
    forgotBtn.disabled = false;
  }
});
