/**
 * @file Handles add-task initialization, shared state and priority controls.
 */


/**
 * Represents a contact that can be assigned to a task.
 *
 * @typedef {Object} Contact
 * @property {string} id - Firebase contact id.
 * @property {string} name - Contact display name.
 * @property {string} [email] - Contact email address.
 * @property {string} [phone] - Contact phone number.
 */

/**
 * Represents a subtask in the add-task form.
 *
 * @typedef {Object} Subtask
 * @property {string} title - Subtask title.
 * @property {boolean} completed - Whether the subtask is completed.
 * @property {boolean} [isEditing] - Whether the subtask is currently edited.
 */

/**
 * Represents the task payload saved to Firebase.
 *
 * @typedef {Object} TaskFormData
 * @property {string} title - Task title.
 * @property {string} description - Task description.
 * @property {string} dueDate - Due date in ISO format.
 * @property {string} priority - Selected priority.
 * @property {string[]} assignedTo - Assigned contact ids.
 * @property {string} category - Selected category.
 * @property {Subtask[]} subtasks - Task subtasks.
 * @property {string} status - Board column status.
 */

/* ── State ── */
/** @type {Contact[]} */
let availableContacts = [];

/** @type {Contact[]} */
let selectedContacts = [];

/** @type {string} */
let selectedPriority = 'medium';

/** @type {Subtask[]} */
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


window.addEventListener('DOMContentLoaded', initAddTask);
