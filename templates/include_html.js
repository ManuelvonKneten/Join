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
  setActiveBottomNavLink();
  setUserInitials();
  initUserDropdown();
  initMobileNavigation();
}

function initUserDropdown() {
  document.onclick = () => closeUserDropdown();
  document.addEventListener("keydown", handleUserDropdownKeydown);
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

function closeUserDropdown(options = {}) {
  const dropdown = document.getElementById("user_dropdown");
  const userButton = document.getElementById("userInitialsBtn");
  const shouldRestoreFocus = options.restoreFocus === true;
  const shouldCloseMobileNavigation = options.closeMobileNavigation !== false;

  if (!dropdown || !userButton) return;

  dropdown.classList.add("d_none");
  userButton.setAttribute("aria-expanded", "false");

  if (shouldRestoreFocus) userButton.focus();
  if (shouldCloseMobileNavigation) closeMobileNavigation();
}

function handleUserDropdownKeydown(event) {
  const dropdown = document.getElementById("user_dropdown");

  if (!dropdown || dropdown.classList.contains("d_none")) return;
  if (event.key !== "Escape") return;

  closeUserDropdown({
    restoreFocus: true,
    closeMobileNavigation: false,
  });
}

function initMobileNavigation() {
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return;

  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileNavigation();
  });

  document.addEventListener("keydown", handleMobileNavigationKeydown);
}

function toggleMobileNavigation(event) {
  event.stopPropagation();

  const isOpen = document.body.classList.toggle("mobile_navigation_open");
  updateMobileNavigationButton(isOpen);

  if (isOpen) focusFirstSidebarLink();
}

function closeMobileNavigation() {
  const wasOpen = document.body.classList.contains("mobile_navigation_open");

  document.body.classList.remove("mobile_navigation_open");
  updateMobileNavigationButton(false);

  if (wasOpen) focusMobileNavigationButton();
}

function updateMobileNavigationButton(isOpen) {
  const menuButton = document.getElementById("mobileMenuBtn");

  if (menuButton) {
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  }
}

function focusMobileNavigationButton() {
  const menuButton = document.getElementById("mobileMenuBtn");

  if (menuButton) menuButton.focus();
}

function focusFirstSidebarLink() {
  const firstSidebarLink = document.querySelector(".sidebar_link");

  if (firstSidebarLink) firstSidebarLink.focus();
}

function handleMobileNavigationKeydown(event) {
  if (!document.body.classList.contains("mobile_navigation_open")) return;

  if (event.key === "Escape") {
    closeMobileNavigation();
    return;
  }

  if (event.key === "Tab") trapMobileNavigationFocus(event);
}

function trapMobileNavigationFocus(event) {
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar) return;

  const focusableElements = getSidebarFocusableElements(sidebar);

  if (!focusableElements.length) {
    event.preventDefault();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (!sidebar.contains(document.activeElement)) {
    event.preventDefault();
    firstElement.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getSidebarFocusableElements(sidebar) {
  const focusableSelectors = 'a[href], button, [tabindex]:not([tabindex="-1"])';
  const focusableElements = sidebar.querySelectorAll(focusableSelectors);

  return Array.from(focusableElements).filter(
    (element) => !element.disabled && element.getClientRects().length > 0
  );
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
      link.setAttribute("aria-current", "page");
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
  sidebarLinks.forEach((link) => {
    link.classList.remove("sidebar_link_active");
    link.removeAttribute("aria-current");
  });
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

function setActiveBottomNavLink() {
  clearBottomNavActiveLinks();

  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".bottom_nav_item");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("bottom_nav_item_active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function clearBottomNavActiveLinks() {
  const navLinks = document.querySelectorAll(".bottom_nav_item");

  navLinks.forEach((link) => {
    link.classList.remove("bottom_nav_item_active");
    link.removeAttribute("aria-current");
  });
}

includeHTML();
