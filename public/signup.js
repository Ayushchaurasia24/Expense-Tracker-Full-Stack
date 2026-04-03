const form = document.getElementById("signupForm");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userDetails)
    });

    const data = await res.json();

    alert(data.message);

    if (res.status === 201) {
      window.location.href = "login.html"; // redirect after signup
    }

  } catch (err) {
    console.log(err);
  }
});