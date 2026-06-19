const BASE_URL = "http://localhost:5000/api/auth";

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const msgBox = document.getElementById("msgBox");
const submitBtn = document.getElementById("submitBtn");

// Shared utility helper to render API feedback messages elegantly
function showMsg(text, isError = true) {
  if (!msgBox) return;
  msgBox.textContent = text;
  msgBox.className = isError ? "msg msg-error" : "msg msg-success";
  msgBox.style.display = "block";
}

function setSpinner(loading) {
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Processing Requests... <span class="spinner"></span>`;
  } else {
    submitBtn.disabled = false;
    submitBtn.textContent = signupForm
      ? "Register Account"
      : "Authorize Access";
  }
}

// Handling Admin Sign Up Form Actions
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMsg("Operational entry mismatch. Password checks must match.");
      return;
    }

    setSpinner(true);
    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showMsg(data.message || "System error encountered during validation.");
      } else {
        showMsg(
          "Registration completed! Redirecting over to authentication portal...",
          false,
        );
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      }
    } catch (err) {
      showMsg("Network drop context occurred connecting to Express.");
    } finally {
      setSpinner(false);
    }
  });
}

// Handling Authentication Log In Submissions
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    setSpinner(true);
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showMsg(data.message || "Access Denied.");
      } else {
        // Save access session data context directly inside browser local storage cache
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", data.user.email);
        window.location.href = "dashboard.html";
      }
    } catch (err) {
      showMsg("Connection to API node platform lost.");
    } finally {
      setSpinner(false);
    }
  });
}
