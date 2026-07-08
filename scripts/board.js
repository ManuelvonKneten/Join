                                /* ---  State / Globals --- */
/** @type {Array<Object>} */
let allTasks = [];

/** @type {string|null} */
let currentTaskId = null;

/** @type {string|undefined} */
let currentDraggedTask;

/** @type {string|null} */
let keyboardDraggedTaskId = null;

/** @type {boolean} */
let keyboardModeActive = false;

/** @type {string|null} */
let focusedTaskId = null;


                                        /* --- Init --- */
document.addEventListener('DOMContentLoaded', initBoard);


/**
 * Initializes the board and loads all tasks.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initBoard() {
    initEventListeners();
    await loadAvailableContacts();
    await loadTasks();
    renderBoard();
}


                                        /* --- Init / Event Listeners --- */
/**
 * Registers all event listeners for the board.
 *
 * @returns {void}
 */
function initEventListeners(){
    document.getElementById('search').addEventListener('input', searchTask)
    document.getElementById('search_icon').addEventListener('click', searchTask)
    initMoveToMenu();
}


                                        /* ---  Data Layer (Firebase / API) --- */
/**
 * Loads all tasks from Firebase, stores them in the local state
 * and then renders the board.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadTasks() {
    try {
        const rawTasks = await getFromDB('tasks');

        allTasks = [];

        if (rawTasks) {
            for (const [id, task] of Object.entries(rawTasks)){
                allTasks.push({id, ...task});
            }          
        }
        renderBoard();

    } catch (error) {
        console.error('Tasks could not be loaded!', error);
    }
}


/**
 * Saves the edited task data to Firebase.
 *
 * @async
 * @param {string} taskId - ID of the task
 * @returns {Promise<void>}
 */
async function saveTaskEdit(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    const dueDateInput = document.getElementById("editDueDate");
    const dueDateError = document.getElementById("editDueDateError");
    const isoDate = dueDateInput.value ? ddmmyyyyToISO(dueDateInput.value) : '';
    const dateInvalid = !isoDate || isPastDate(new Date(`${isoDate}T00:00:00`));

    toggleRequiredError(dueDateInput, dueDateError, dateInvalid);
    if (dateInvalid) return;

    applyTaskEditValues(task, isoDate);
    await patchTask(taskId, task);
    closeTaskPopUp();
    await loadTasks();
    renderBoard();
}


/**
 * Applies the edit form values to the given task object.
 *
 * @param {Object} task - The task to update.
 * @param {string} isoDate - Due date in YYYY-MM-DD format.
 * @returns {void}
 */
function applyTaskEditValues(task, isoDate) {
    task.title = document.getElementById("editTitle").value;
    task.description = document.getElementById("editDescription").value;
    task.dueDate = isoDate;
    task.subtasks = taskEditSubtasks;
    task.priority = document.querySelector(".add_task_prio_btn.active")?.dataset.priority;
    task.assignedTo = selectedEditContacts.map(c => c.id);
}


/**
 * Moves a task to another column,
 * updates the status in Firebase
 * and then reloads the board.
 *
 * @async
 * @param {DragEvent} event - The drop event.
 * @returns {Promise<void>}
 */
async function moveTo(event) {

    const dropField = event.currentTarget;

    dropField.classList.remove('task_field_highlight');
    const newStatus = event.currentTarget.dataset.status;

    await moveTaskToStatus(currentDraggedTask, newStatus);
}


/**
 * Moves a task to a new board status
 * and uses the central save logic for drag & drop.
 *
 * @async
 * @param {string} taskId - Firebase ID of the task.
 * @param {string} newStatus - Target status.
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(taskId, newStatus) {
    if (!taskId || !newStatus) return;

    await patchToDB(`tasks/${taskId}`, { status: newStatus
    });
    await loadTasks(); 
}


/**
 * Moves the task currently selected via keyboard
 * to a new status.
 *
 * @async
 * @param {string} newStatus - Target status.
 * @returns {Promise<void>}
 */
async function moveKeyboardTask(newStatus) {
    const taskId = keyboardDraggedTaskId;

    await moveTaskToStatus(taskId, newStatus);
}


                                    /* --- Render Functions --- */
/**
 * Clears all board columns and then re-renders all tasks.
 *
 * @param {Array<Object>} [tasks=allTasks] - The tasks to display.
 * @returns {void}
 */
function renderBoard(tasks = allTasks) {
     document.querySelector('#toDo .task_field').innerHTML = '';
     document.querySelector('#InProgress .task_field').innerHTML = '';
     document.querySelector('#awaitFeedback .task_field').innerHTML = '';
     document.querySelector('#done .task_field').innerHTML = '';

     for (const task of tasks) {
        renderTask(task);
     }
     renderEmptyCards();
}


/**
 * Renders a single task into the matching board column
 * based on its status.
 *
 * @param {Object} task - The task object.
 * @param {string} task.id - The Firebase ID of the task.
 * @param {string} task.status - The current status of the task.
 * @returns {void}
 */
function renderTask(task) {
    const containers = {
        todo: '#toDo .task_field',
        inprogress: '#InProgress .task_field',
        awaitfeedback: '#awaitFeedback .task_field',
        done: '#done .task_field'
    };

    const container = document.querySelector(containers[task.status]);

    if (!container) return;
    container.innerHTML += getTaskTemplate(task);
}


/**
 * Shows a placeholder card for empty board columns.
 *
 * @returns {void}
 */
function renderEmptyCards() {
    const taskFields = document.querySelectorAll('.task_field');

    for (const taskField of taskFields) {
        if (!taskField.innerHTML.trim()) {
        const fieldName = taskField.parentElement.querySelector('h3').textContent;
        taskField.innerHTML =  getEmptyCardTemplate(fieldName);
      }
    }
}


/**
 * Renders the subtasks in the task detail popup.
 *
 * @param {Array<Object>} [subtasks=[]] - List of subtasks.
 * @param {string} taskId - ID of the task.
 * @returns {string} HTML string.
 */
function renderSubtasks(subtasks = [], taskId) {
    if(!subtasks.length) return "<p>No Subtasks</p>"

    let html = "";
    let index = 0;

    for (const subtask of subtasks) {
        html += getSubtasksTemplate(subtask, index, taskId);
        index++; 
    }
    return html;
}


/**
 * Renders the selectable contacts in the edit task dropdown.
 *
 * @returns {void}
 */
function renderAssignedOptionsEdit() {
    
    const container = document.getElementById('assignedOptionsEdit');

    if(!container) return;

    container.innerHTML = availableContacts.map(contact => {
        const checked = selectedEditContacts.some (c =>  c.id === contact.id);

        return getAssignedOptionsEdit(contact, checked);

    }).join("");
}


/**
 * Renders the avatars of the selected contacts in the edit popup.
 *
 * @returns {void}
 */
function renderAssignedAvatarsEdit() {
    const html = buildAvatarsHTML(
        selectedEditContacts.map(c => c.id),
        availableContacts,
        showAllAvatarsEditTask
    );

    const container = document.getElementById("assignedAvatarsEdit");
    container.innerHTML = html;

    const btn = container.querySelector(".js_more_avatars");
    if (btn) {
        btn.addEventListener("click", showAllAssignedAvatarsEditTask);
    }
}


/**
 * Toggles between the compact and full display
 * of the assigned avatars in the edit task popup and then
 * re-renders the avatar list.
 *
 * @returns {void}
 */
function showAllAssignedAvatarsEditTask() {
    showAllAvatarsEditTask = !showAllAvatarsEditTask;
    renderAssignedAvatarsEdit();
}


/**
 * Renders all subtasks in the edit task popup.
 *
 * @returns {void}
 */
function renderSubtasksEdit() {
    const container = document.getElementById('editSubtasks');

    container.innerHTML = '';
    taskEditSubtasks.forEach((subtask, index) => {
        container.innerHTML += getSubtasksEditTemplate(subtask, index)
    });
}
  
