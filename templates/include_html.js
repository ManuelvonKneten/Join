async function includeHTML() {
  const includeElements = document.querySelectorAll("[data-include]");

  for (const element of includeElements) {
    const filePath = element.dataset.include;
    const response = await fetch(filePath);
    const html = await response.text();

    element.innerHTML = html;
    element.removeAttribute("data-include");
  }

  setActiveSidebarLink();
  setUserInitials();
  initUserDropdown();
  initMobileNavigation();
}

function initUserDropdown() {
  document.onclick = closeUserDropdown;
}

function toggleUserDropdown(event) {
  event.stopPropagation();

  const dropdown = document.getElementById("user_dropdown");
  const userButton = document.getElementById("userInitialsBtn");

  if (!dropdown || !userButton) return;

  const isOpen = !dropdown.classList.contains("d_none");
  dropdown.classList.toggle("d_none");
  userButton.setAttribute("aria-expanded", isOpen ? "false" : "true");
}

function closeUserDropdown() {
  const dropdown = document.getElementById("user_dropdown");
  const userButton = document.getElementById("userInitialsBtn");

  if (!dropdown || !userButton) return;

  dropdown.classList.add("d_none");
  userButton.setAttribute("aria-expanded", "false");
  closeMobileNavigation();
}

function initMobileNavigation() {
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return;

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileNavigation();
  });
}

function toggleMobileNavigation(event) {
  event.stopPropagation();

  const isOpen = document.body.classList.toggle("mobile_navigation_open");
  const menuButton = document.getElementById("mobileMenuBtn");

  if (menuButton) {
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  }
}

function closeMobileNavigation() {
  document.body.classList.remove("mobile_navigation_open");

  const menuButton = document.getElementById("mobileMenuBtn");

  if (menuButton) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }
}

function setActiveSidebarLink() {
  clearSidebarActiveLinks();
  clearFooterActiveLinks();

  const currentPage = window.location.pathname.split("/").pop();
  const sidebarLinks = document.querySelectorAll(".sidebar_link");

  sidebarLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("sidebar_link_active");
    }
  });
}

// Render Function, damit nur der Content in der Mitte neu geladen wird.

async function renderContent(url) {
  const response = await fetch(url);
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!document.querySelector(`link[href="${href}"]`)) {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = href;
      document.head.appendChild(newLink);
    }
  });

  const fetchedMain = doc.querySelector("main");
  const currentMain = document.querySelector("main");
  if (fetchedMain && currentMain) {
    currentMain.innerHTML = fetchedMain.innerHTML;
    currentMain.className = fetchedMain.className;
  }

  document.title = doc.title;
}

async function openFooterContent(url, clickedLink) {
  await renderContent(url);
  clearSidebarActiveLinks();
  clearFooterActiveLinks();
  clickedLink.classList.add("sidebar_footer_link_active");
}

function clearSidebarActiveLinks() {
  const sidebarLinks = document.querySelectorAll(".sidebar_link");
  sidebarLinks.forEach((link) => link.classList.remove("sidebar_link_active"));
}

function clearFooterActiveLinks() {
  const footerLinks = document.querySelectorAll(".sidebar_footer_link");
  footerLinks.forEach((link) =>
    link.classList.remove("sidebar_footer_link_active")
  );
}

function setUserInitials() {
  const btn = document.getElementById("userInitialsBtn");
  if (!btn) return;
  const name = localStorage.getItem("currentUser") || "";
  btn.textContent = name ? initials(name) : "?";
}

includeHTML();
