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
}


function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split("/").pop();
  const sidebarLinks = document.querySelectorAll(".sidebar_link");

  sidebarLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();

    if (linkPage === currentPage) {
      link.classList.add("sidebar_link_active");
    }
  });
}


includeHTML();