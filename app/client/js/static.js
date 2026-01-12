lucide.createIcons();

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
const pageTitle = document.getElementById("pageTitle");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");

  toggleBtn.innerHTML = sidebar.classList.contains("collapsed")
    ? '<i data-lucide="chevron-right"></i>'
    : '<i data-lucide="chevron-left"></i>';

  lucide.createIcons();
});