                                       /* --- Pop-Ups --- */
let showAllTaskPopupAvatars = false;

/**
 * Closes the task detail/edit modal when the click lands outside the
 * visible card. Checking the card (instead of `event.target === dialog`)
 * also works on mobile, where the card fills almost the whole screen and
 * the dialog element itself is never the direct click target.
 *
 * Clicks whose target was already removed from the DOM by a re-render
 * (e.g. opening the edit view or updating subtasks replaces the dialog
 * content) are ignored, so the popup does not close itself instantly.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleDialogClick(event) {
    if (!event.target.isConnected) return;
    const dialog = event.currentTarget;
    const card = dialog.querySelector('.dialog_content, .edit_content');
    if (card && !card.contains(event.target)) {
        dialog.close();
    }
}


/**
 * Closes the add-task modal when the click lands outside the visible card.
 * Clicks whose target was removed by a re-render are ignored.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleDialogAddTaskBoard (event) {
    if (!event.target.isConnected) return;
    const dialog = event.currentTarget;
    const card = dialog.querySelector('.add_task_layout');
    if (card && !card.contains(event.target)) {
        dialog.close();
    }
}

dialog_add_task_board.addEventListener('click', handleDialogAddTaskBoard);


/**
 * Reference to the task detail dialog element.
 *
 * @type {HTMLDialogElement}
 */
const dialogTask = document.getElementById('dialogTask');
dialogTask.addEventListener('click', handleDialogClick);


/**
 * Opens the detail popup of a task.
 *
 * @param {string} taskId - ID of the task
 * @returns {void}
 */
function openTaskPopUp(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    
    if(!task) return;
    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getTaskDetailsTemplate(task);

    const btn = dialogTask.querySelector(".js_more_avatars");

    if (btn) {
        btn.addEventListener("click", () => showAllAssignedAvatarsTask(taskId));
    }
    dialogTask.showModal(); 
}


/**
 * Shows all assigned avatars in the task detail popup
 * and then re-renders the popup.
 *
 * @param {string} taskId - ID of the task.
 * @returns {void}
 */
function showAllAssignedAvatarsTask(taskId) {
    showAllTaskPopupAvatars = true;
    openTaskPopUp(taskId);
}


/**
 * Opens the edit task popup and loads the task data into the form.
 *
 * @async
 * @param {string} taskId - ID of the task
 * @returns {Promise<void>}
 */
async function openEditTaskPopup(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    
    taskEditSubtasks = Array.isArray(task.subtasks) ? [...task.subtasks] : [];

    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getEditTaskTemplate(task);
    if(!dialogTask.open) dialogTask.showModal();

    setupPriorityButtons();
    setPriority(task.priority);
    renderSubtasksEdit();
    showAllAvatarsEditTask = false;
    await initEditAssigned(task);
    renderAssignedAvatarsEdit();
    setupEditDueDateInput(task.dueDate);
}


/**
 * Initializes the date field in the edit task popup.
 * Fills the text input with DD/MM/YYYY and wires up the picker + validation.
 *
 * @param {string} isoDate - Date in YYYY-MM-DD format
 * @returns {void}
 */
function setupEditDueDateInput(isoDate) {
    const input  = document.getElementById('editDueDate');
    const picker = document.getElementById('editDueDatePicker');
    const error  = document.getElementById('editDueDateError');

    picker.min = getLocalISODate();
    if (isoDate) {
        const [year, month, day] = isoDate.split('-');
        input.value = `${day}/${month}/${year}`;
    }
    wireEditDueDateListeners(input, picker, error);
}


/**
 * Wires keyboard, input, blur and picker listeners for the edit due date field.
 *
 * @param {HTMLInputElement} input - Text input DD/MM/YYYY
 * @param {HTMLInputElement} picker - Native date picker input
 * @param {HTMLElement} error - Error message element
 * @returns {void}
 */
function wireEditDueDateListeners(input, picker, error) {
    input.addEventListener('keydown', handleDueDateBackspace);
    input.addEventListener('input',   formatDueDateInput);
    input.addEventListener('blur',    () => validateEditDueDate(input, error));
    picker.addEventListener('change', (e) => {
        syncPickerDateToTextInput(e, input);
        validateEditDueDate(input, error);
    });
}


/**
 * Validates the date field in the edit task popup.
 *
 * @param {HTMLInputElement} input - Text input DD/MM/YYYY
 * @param {HTMLElement} error - Error message element
 * @returns {void}
 */
function validateEditDueDate(input, error) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input.value)) {
        toggleRequiredError(input, error, true);
        return;
    }
    const selected = new Date(`${ddmmyyyyToISO(input.value)}T00:00:00`);
    toggleRequiredError(input, error, isPastDate(selected));
}


/**
 * Opens the native date picker in the edit task popup.
 *
 * @returns {void}
 */
function openEditDueDatePicker() {
    const picker = document.getElementById('editDueDatePicker');
    if (picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
}


/**
 * Opens the "Add Task" popup on the board.
 * Loads the HTML dynamically and initializes the form.
 *
 * @async
 * @param {string} [status='todo'] - Default status for the new task
 * @returns {Promise<void>}
 */
async function openAddTaskPopUp(status = 'todo') {
    const taskStatus = validateTaskStatus(status);

    if (isMobileAddTaskViewport()) {
        window.location.href = `./add_task.html?status=${taskStatus}`;
        return;
    }

    const dialog = document.getElementById('dialog_add_task_board');
    dialog.innerHTML = await buildAddTaskContent();
    dialog.querySelector('.add_task_layout')?.classList.add('add_task_layout_popup');

    window.currentTaskStatus = taskStatus;
    await initAddTask();
    dialog.showModal();
}


/**
 * Checks whether add task should open as a page instead of a dialog.
 *
 * @returns {boolean} True for board viewports up to and including 767 px.
 */
function isMobileAddTaskViewport() {
    return window.innerWidth <= 767;
}


/**
 * Fetches the add task HTML and returns the popup layout markup.
 *
 * @async
 * @returns {Promise<string>} Outer HTML of the add task layout.
 */
async function buildAddTaskContent() {
    const response = await fetch('./add_task.html');
    let html = await response.text();
    html = html.replace('<h1 class="add_task_heading">Add Task</h1>', getNewHTMLTag());

    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.querySelector('.add_task_layout').outerHTML;
}


/**
 * Opens the delete confirm popup and stores the task ID.
 *
 * @param {string} taskId - ID of the task to delete
 * @returns {void}
 */
function openDeletePopup(taskId) {
    currentTaskId = taskId;
    document.getElementById('delete_task').showModal();
}


/**
 * Closes the task detail popup.
 *
 * @returns {void}
 */
function closeTaskPopUp() {
   document.getElementById('dialogTask').close();
}


/**
 * Closes the "Add Task" popup.
 *
 * @returns {void}
 */
function closeAddTaskPopUp() {
    document.getElementById('dialog_add_task_board').close();
}


/**
 * Closes the delete confirm popup.
 *
 * @returns {void}
 */
function closeDeleteTask() {
    document.getElementById('delete_task').close();
}


/**
 * Changes the status of a subtask and saves the change.
 *
 * @param {string} taskId - ID of the task.
 * @param {number} subtaskIndex - Index of the subtask.
 * @returns {void}
 */
function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) {
        console.error("No task found:", taskId);
        return;
    }

    const subtask = task.subtasks[subtaskIndex];
    subtask.completed = !subtask.completed;
    patchTask(taskId, { subtasks: task.subtasks });

    const card = document.querySelector(`[data-id="${taskId}"]`);
    if (card) card.outerHTML = getTaskTemplate(task);
}


/**
 * Deletes a task from Firebase and from the local state.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteTask() {
    await deleteFromDB(`tasks/${currentTaskId}`);

    allTasks = allTasks.filter(task => task.id !== currentTaskId);
    
    renderBoard();
    showTaskToast('Task deleted successfully');

    document.getElementById('delete_task').close();
    closeTaskPopUp();
}
