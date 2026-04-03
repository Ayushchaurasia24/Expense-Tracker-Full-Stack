const form = document.getElementById("loginForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userDetails)
    });

    const data = await res.json();

    if (res.status === 200) {
      // ✅ Save token
      localStorage.setItem("token", data.token);

      alert("Login successful");

      // ✅ Redirect AFTER success
      window.location.href = "expense.html";
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
});