/**
 * @file Handles the summary dashboard rendering and task counters.
 */

/**
 * Global active user.
 *
 * @type {string}
 */
let currentUser = localStorage.getItem("currentUser") || "Guest";

/**
 * Represents a task object used on the summary dashboard.
 *
 * @typedef {Object} Task
 * @property {string} [status] - The current task status, for example "todo", "done", "inprogress" or "awaitfeedback".
 * @property {string} [priority] - The task priority, for example "urgent".
 * @property {string} [dueDate] - The task due date as a date string.
 */

/**
 * Returns greeting text for the current user and time.
 *
 * @returns {string}
 */


function getGreetingText() {
  const currentHour = new Date().getHours();
  const isGuest = currentUser === "Guest";
  const punctuation = isGuest ? "!" : ",";
  const greetingBaseText = getGreetingBaseText(currentHour);

  return greetingBaseText + punctuation;
}


/**
 * Returns the base greeting for a given hour.
 *
 * @param {number} currentHour
 * @returns {string}
 */
function getGreetingBaseText(currentHour) {
  if (currentHour >= 6 && currentHour < 12) {
    return "Good morning";
  }

  if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon";
  }

  if (currentHour >= 18 && currentHour < 20) {
    return "Good evening";
  }

  return "Good night";
}


/**
 * Renders the greeting text and the current user name into the summary page.
 *
 * The user name is read from localStorage.
 *
 * @returns {void}
 */
function renderGreeting() {
  const greetingElement = document.getElementById("summary_greeting");
  const userElement = document.getElementById("summary_user_name");

  if (!greetingElement || !userElement) return;

  greetingElement.innerText = getGreetingText();

  if (currentUser === "Guest") currentUser = "";
  userElement.innerText = currentUser;
}


// firebase-actions
/**
 * Loads task records from the database and updates the summary dashboard.
 *
 * @returns {Promise<void>}
 */
async function loadSummaryTasks() {
  const taskObject = await getFromDB("tasks");
  const tasks = Object.values(taskObject || {});
  renderSummaryCounts(tasks);
  renderUpcomingDeadline(tasks);
}


/**
 * Renders all summary stat counts from the given tasks.
 *
 * @param {Array<Object>} tasks - The list of task records.
 * @returns {void}
 */
function renderSummaryCounts(tasks) {
  setSummaryText("summary_todo_amount", countSummaryTasksByKey(tasks, "status", "todo"));
  setSummaryText("summary_done_amount", countSummaryTasksByKey(tasks, "status", "done"));
  setSummaryText("summary_urgent_amount", countSummaryTasksByKey(tasks, "priority", "urgent"));
  setSummaryText("summary_board_amount", tasks.length);
  setSummaryText("summary_progress_amount", countSummaryTasksByKey(tasks, "status", "inprogress"));
  setSummaryText("summary_feedback_amount", countSummaryTasksByKey(tasks, "status", "awaitfeedback"));
}


/**
 * Sets inner text for a summary stat element.
 *
 * @param {string} id - Element id to update.
 * @param {number|string} value - Text to render.
 * @returns {void}
 */
function setSummaryText(id, value) {
  const element = document.getElementById(id);

  if (!element) return;

  element.innerText = value;
}


/**
 * Counts tasks matching a specific key/value pair.
 *
 * @param {Task[]} tasks
 * @param {string} key
 * @param {string} value
 * @returns {number}
 */
function countSummaryTasksByKey(tasks, key, value) {
  return tasks.filter((task) => task[key] === value).length;
}

/**
 * Finds and displays the next urgent upcoming deadline.
 *
 * @param {Task[]} tasks
 * @returns {void}
 */
function renderUpcomingDeadline(tasks) {
  const upcomingUrgentTasks = tasks
    .filter((task) => task.priority === "urgent")
    .filter((task) => isUpcomingDate(task.dueDate))
    .sort((taskA, taskB) => {
      return new Date(taskA.dueDate) - new Date(taskB.dueDate);
    });

  const nextTask = upcomingUrgentTasks[0];

  if (!nextTask) {
    setSummaryText("summary_deadline", "No deadline");
    return;
  }

  setSummaryText("summary_deadline", formatSummeryDate(nextTask.dueDate));
}


/**
 * Determines whether a date string points to today or a future date.
 *
 * @param {string} dateString
 * @returns {boolean}
 */
function isUpcomingDate(dateString) {
  const today = new Date();
  const taskDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate >= today;
}


/**
 * Formats a due date for display on the summary dashboard.
 *
 * @param {string} dateString
 * @returns {string}
 */
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
