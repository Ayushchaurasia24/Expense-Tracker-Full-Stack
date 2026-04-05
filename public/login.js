// ================= LOGIN =================
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userDetails = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
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
      localStorage.setItem("token", data.token);

      alert("Login successful");
      window.location.href = "expense.html";
    } else {
      alert(data.message);
    }

  } catch (err) {
    console.log(err);
    alert("Something went wrong");
  }
});


// ================= SHOW FORGOT FORM =================
function showForgotForm() {
  document.getElementById("forgotForm").style.display = "block";
}


// ================= FORGOT PASSWORD =================
const forgotForm = document.getElementById("forgotForm");

forgotForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value;

  try {
    const res = await axios.post(
      "http://localhost:3000/password/forgotpassword",
      { email }
    );

    alert(res.data.message);

  } catch (err) {
    console.log(err);
    alert("Error sending email");
  }
});