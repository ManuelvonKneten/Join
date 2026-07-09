/**
 * @file Handles add-task initialization, shared state and priority controls.
 */


/* ── State ── */
/**
 * List of all available contacts.
 *
 * @type {Contact[]}
 */
let availableContacts = [];


/**
 * List of contacts assigned to the current task.
 *
 * @type {Contact[]}
 */
let selectedContacts = [];


/**
 * Currently selected task priority.
 *
 * @type {string}
 */
let selectedPriority = 'medium';


/**
 * List of subtasks for the current task.
 *
 * @type {Subtask[]}
 */
let taskSubtasks = [];


/**
 * Initializes the add-task page:
 * loads contacts and sets up all event listeners.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initAddTask() {
    if (!document.getElementById('assignedOptions')) return;

    initAddTaskEventListeners();
    setDefaultPriority();
    await loadAvailableContacts();
    renderAssignedOptions();
}


/**
 * Initializes all add-task event listeners.
 *
 * @returns {void}
 */
function initAddTaskEventListeners() {
    setupPriorityButtons();
    setupSubtaskInput();
    setupClearButton();
    setupAssignedDropdown();
    setupCategoryDropdown();
    setupDueDateInput();
    setupRequiredFieldValidation();
}


/**
 * Sets medium priority as the default active priority.
 *
 * @returns {void}
 */
function setDefaultPriority() {
    const mediumBtn = document.querySelector('.add_task_prio_btn[data-priority="medium"]');
    if (!mediumBtn) return;
    mediumBtn.classList.add('active');
    mediumBtn.setAttribute('aria-pressed', 'true');
    selectedPriority = 'medium';
}


/* ── Priority ── */
/**
 * Adds a click listener to each priority button.
 *
 * @returns {void}
 */
function setupPriorityButtons() {
    document.querySelectorAll('.add_task_prio_btn').forEach(button => {
        button.addEventListener('click', onPriorityButtonClick);
    });
}


/**
 * Sets the active priority button and stores the selected priority.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function onPriorityButtonClick(event) {
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    event.currentTarget.classList.add('active');
    event.currentTarget.setAttribute('aria-pressed', 'true');
    selectedPriority = event.currentTarget.dataset.priority;
}


/**
 * Registers the DOMContentLoaded listener that starts the add task page.
 *
 * @returns {void}
 */
function initAddTaskOnLoad() {
    window.addEventListener('DOMContentLoaded', initAddTask);
}

initAddTaskOnLoad();
