function getGreetingText() {
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return "Good morning,";
  }

  if (currentHour >= 12 && currentHour < 18) {
    return "Good day,";
  }

  if (currentHour >= 18 && currentHour < 20) {
    return "Good evening,";
  }

  return "Good night,";
}

function renderGreeting() {
  const greetingElement = document.getElementById("summary_greeting");
  const userElement = document.getElementById("summary_user_name");

  if (!greetingElement || !userElement) return;

  const userName = localStorage.getItem("currentUser") || "Guest";

  greetingElement.innerText = getGreetingText();
  userElement.innerText = userName;
}

renderGreeting();