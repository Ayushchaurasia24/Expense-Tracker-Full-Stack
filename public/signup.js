// ================= BASE URL =================
const BASE_URL = "/api";

// ================= TOAST HELPER =================
function toast(msg, type = 'success') {
  const container = document.getElementById('toast');
  const el = document.createElement('div');
  el.className = `toast-msg ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ================= SIGNUP =================
const signupForm = document.getElementById("signupForm");
const submitBtn  = document.getElementById("submitBtn");

signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };

  submitBtn.classList.add("btn-loading");
  submitBtn.disabled = true;

  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userDetails)
    });

    const data = await res.json();

    if (res.status === 201) {
      toast("Account created! Redirecting…", "success");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1400);

    } else {
      toast(data.message || "Signup failed", "error");
    }

  } catch (err) {
    console.error(err);
    toast("Network error. Please try again.", "error");
  }

  submitBtn.classList.remove("btn-loading");
  submitBtn.disabled = false;
});