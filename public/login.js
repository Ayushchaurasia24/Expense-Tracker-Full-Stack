const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  console.log("Login Data:", userDetails);

  alert("Login button clicked (API coming next)");
});