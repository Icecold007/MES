document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("adminToken");
  const email = localStorage.getItem("adminEmail");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  const userDisplay = document.getElementById("userDisplay");
  const heroName = document.getElementById("heroName");

  if (userDisplay) userDisplay.textContent = `Admin: ${email}`;
  if (heroName) heroName.textContent = email.split("@")[0];
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    window.location.href = "login.html";
  });
}
