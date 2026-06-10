function getGreetingText() {
  const currentHour = new Date().getHours();

  if (currentHour >= 6 && currentHour < 12) {
    return "Good morning,";
  }

  if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon,";
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



// firebase-actions
async function loadSummaryTasks() {
  const taskObject = await getFromDB("tasks");
  const tasks = Object.values(taskObject ||{});

  console.log("Loaded tasks:", tasks);
  setSummaryText("summary_todo_amount", countSummaryTasksByKey(tasks, "status", "todo"));
  setSummaryText("summary_done_amount", countSummaryTasksByKey(tasks, "status", "done"));

  setSummaryText("summary_urgent_amount", countSummaryTasksByKey(tasks, "priority", "urgent"));

  setSummaryText("summary_board_amount", tasks.length);
  setSummaryText("summary_progress_amount", countSummaryTasksByKey(tasks, "status", "inprogress"));
  setSummaryText("summary_feedback_amount", countSummaryTasksByKey(tasks, "status", "awaitfeedback"));

  renderUpcomingDeadline(tasks);
}

function setSummaryText(id, value) {
  const element = document.getElementById(id);

  if (!element) return;

  element.innerText = value;
}

function countSummaryTasksByKey(tasks, key, value) {
  return tasks.filter((task) => task[key] === value).length;
}

function renderUpcomingDeadline(tasks) {
  const upcomingUrgentTasks = tasks
    .filter((task) => task.priority === "urgent")
    .filter((task) => isUpcomingDate(task.dueDate))
    .sort((taskA,taskB) => {
      return new Date(taskA.dueDate) - new Date(taskB.dueDate);
    });
  
  const nextTask = upcomingUrgentTasks[0];
  
  if (!nextTask) {
    setSummaryText("summary_deadline", "No deadline");
    return;
  }

  setSummaryText("summary_deadline", formatSummeryDate(nextTask.dueDate));
}

function isUpcomingDate(dateString) {

  const today = new Date();
  const taskDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate >= today;
}

function formatSummeryDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

renderGreeting();
loadSummaryTasks();