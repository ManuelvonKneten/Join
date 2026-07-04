/**
 * @file Handles the add-task form, including contact assignment, priority,
 * subtasks, due date formatting, validation and task creation.
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



/* ── Init ── */
document.addEventListener('DOMContentLoaded', initAddTask);


/**
 * Initialisiert die Add-Task-Seite:
 * lädt Kontakte und richtet alle Event Listener ein.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initAddTask() {
    if (!document.getElementById('assignedOptions')) return;

    await loadAvailableContacts();
    renderAssignedOptions();
    setupPriorityButtons();
    setDefaultPriority();
    setupSubtaskInput();
    setupClearButton();
    setupAssignedDropdown();
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


/**
 * Validates all required task form fields and updates visible error states.
 *
 * @returns {boolean} Whether the task form is valid.
 */
function validateTaskForm() {
    const title    = document.getElementById('taskTitle');
    const dueDate  = document.getElementById('taskDueDate');
    const category = document.getElementById('taskCategory');
    const dueDateError  = document.getElementById('taskDueDateError');
    const categoryError = document.getElementById('taskCategoryError');

    const titleValid = validateTitleField(title);
    validateDueDate(dueDate);
    const dueDateValid = !isDueDateInvalid(dueDateError);
    const categoryValid = validateTaskCategory(category, categoryError);

    return titleValid && dueDateValid && categoryValid;
}


/**
 * Validates the task title field and updates its required error state.
 *
 * @param {HTMLInputElement} title - Title input to validate.
 * @returns {boolean} Whether the title is valid.
 */
function validateTitleField(title) {
    const titleError = document.getElementById('taskTitleError');
    const isEmpty = !title.value.trim();
    toggleRequiredError(title, titleError, isEmpty);
    return !isEmpty;
}


/**
 * Validates the selected task category and updates its error state.
 *
 * @param {HTMLInputElement} category - Category field to validate.
 * @param {HTMLElement} categoryError - Category error message element.
 * @returns {boolean} Whether a category is selected.
 */
function validateTaskCategory(category, categoryError) {
    const noCategory = !category.value;
    if (categoryError) categoryError.classList.toggle('visible', noCategory);
    document.querySelector('#categoryDropdown .assigned_trigger')
        ?.classList.toggle('input_invalid', noCategory);
    return !noCategory;
}


/**
 * Checks whether the due-date error is currently visible.
 *
 * @param {HTMLElement} dueDateError - Due-date error message element.
 * @returns {boolean} Whether the due date is invalid.
 */
function isDueDateInvalid(dueDateError) {
    return dueDateError.classList.contains('visible');
}


/**
 * Zeigt bei den Pflichtfeldern Title und Due Date den Hinweis
 * "This field is required" an, sobald das Feld leer verlassen wird (onblur).
 * Beim erneuten Tippen wird der Hinweis wieder ausgeblendet.
 *
 * @returns {void}
 */
function setupRequiredFieldValidation() {
    const fields = [
        { input: 'taskTitle', error: 'taskTitleError' },
    ];

    fields.forEach(({ input, error }) => {
        const field = document.getElementById(input);
        const message = document.getElementById(error);
        if (!field || !message) return;

        field.addEventListener('blur', () => toggleRequiredError(field, message, !field.value.trim()));
        field.addEventListener('input', () => toggleRequiredError(field, message, false));
    });
}


/**
 * Blendet den Pflichtfeld-Hinweis ein oder aus und markiert das Eingabefeld.
 *
 * @param {HTMLInputElement} field - Input element to mark as invalid.
 * @param {HTMLElement} message - Error message element to show or hide.
 * @param {boolean} show - Whether the error state should be visible.
 * @returns {void}
 */
function toggleRequiredError(field, message, show) {
    message.classList.toggle('visible', show);
    field.classList.toggle('input_invalid', show);
}


/* ── Priority ── */
/**
 * Fügt jedem Priority-Button einen Click-Listener hinzu.
 *
 * @returns {void}
 */
function setupPriorityButtons() {
    document.querySelectorAll('.add_task_prio_btn').forEach(button => {
        button.addEventListener('click', onPriorityButtonClick);
    });
}


/**
 * Setzt den aktiven Priority-Button und speichert die gewählte Priorität.
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


/* ── Create Task ── */
/**
 * Wird beim Form-Submit aufgerufen.
 * Liest alle Formularfelder aus, speichert den Task in Firebase
 * und leitet bei Erfolg zum Board weiter.
 *
 * @async
 * @param {Event} submitEvent
 * @returns {Promise<void>}
 */
async function createTask(submitEvent) {
    submitEvent.preventDefault();

    if (!validateTaskForm()) return;

    const taskData = getTaskFormData();
    const submitButton = getCreateTaskButton(submitEvent);
    setCreateTaskButtonSaving(submitButton);
    await saveTask(taskData, submitButton);
}


/**
 * Gets the create-task submit button from the submitted form.
 *
 * @param {Event} submitEvent - Submit event from the add-task form.
 * @returns {HTMLButtonElement} Create-task button.
 */
function getCreateTaskButton(submitEvent) {
    return submitEvent.target.querySelector('.add_task_btn_create');
}


/**
 * Disables the create-task button and shows the saving state.
 *
 * @param {HTMLButtonElement} button - Create-task button.
 * @returns {void}
 */
function setCreateTaskButtonSaving(button) {
    button.disabled = true;
    button.textContent = 'Saving…';
}


/**
 * Restores the create-task button after a failed save.
 *
 * @param {HTMLButtonElement} button - Create-task button.
 * @returns {void}
 */
function resetCreateTaskButton(button) {
    button.disabled = false;
    button.innerHTML = 'Create Task <span>&#x2713;</span>';
}


/**
 * Saves a task and handles success or failure UI updates.
 *
 * @async
 * @param {TaskFormData} taskData - Task payload to save.
 * @param {HTMLButtonElement} submitButton - Create-task button.
 * @returns {Promise<void>}
 */
async function saveTask(taskData, submitButton) {
    try {
        await postToDB('tasks', taskData);
        onTaskCreated();
    } catch (error) {
        console.error('Task could not be saved:', error);
        resetCreateTaskButton(submitButton);
        showTaskToast('Task could not be saved. Please try again.', true);
    }
}


/**
 * Wandelt ein Datum im Format DD/MM/YYYY in das ISO-Format YYYY-MM-DD um.
 *
 * @param {string} dateStr - Datum im Format DD/MM/YYYY
 * @returns {string} Datum im Format YYYY-MM-DD
 */
function ddmmyyyyToISO(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}


/**
 * Liest alle Formularfelder aus und gibt ein Task-Objekt zurück.
 *
 * @returns {TaskFormData} Current form values as task payload.
 */
function getTaskFormData() {
    return {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        dueDate: ddmmyyyyToISO(document.getElementById('taskDueDate').value),
        priority: selectedPriority,
        assignedTo: selectedContacts.map(c => c.id),
        category: document.getElementById('taskCategory').value,
        subtasks: taskSubtasks,
        status: window.currentTaskStatus || 'todo'
    };
}


/**
 * Wird nach erfolgreichem Speichern aufgerufen.
 * Leitet zum Board weiter.
 *
 * @returns {void}
 */
function onTaskCreated() {
    const notice = document.getElementById('taskAddedNotice');
    if (!notice) {
        window.location.href = '../htmls/board.html';
        return;
    }
    notice.classList.add('show');
    setTimeout(() => { window.location.href = '../htmls/board.html'; }, 1200);
}


/* ── Due Date ── */
/**
 * Formatiert das Due-Date-Feld automatisch als DD/MM/YYYY während der Eingabe.
 *
 * @returns {void}
 */
function setupDueDateInput() {
    const input  = document.getElementById('taskDueDate');
    const picker = document.getElementById('taskDueDatePicker');

    setDueDatePickerMinDate(picker);
    input.addEventListener('keydown', handleDueDateBackspace);
    input.addEventListener('input', formatDueDateInput);
    picker.addEventListener('change', (e) => syncPickerDateToTextInput(e, input));
    input.addEventListener('blur', () => validateDueDate(input));
}


/**
 * Sets the native due-date picker minimum to today's local date.
 *
 * @param {HTMLInputElement} picker - Hidden native date input.
 * @returns {void}
 */
function setDueDatePickerMinDate(picker) {
    picker.min = getLocalISODate();
}

/**
 * Removes a trailing slash before the browser deletes another character.
 *
 * @param {KeyboardEvent} event - Keydown event from the due-date text input.
 * @returns {void}
 */
function handleDueDateBackspace(event) {
    const input = event.target;
    if (event.key !== 'Backspace') return;
    if (input.value.endsWith('/')) input.value = input.value.slice(0, -1);
}


/**
 * Formats manual due-date input as DD/MM/YYYY while typing.
 *
 * @param {InputEvent} event - Input event from the due-date text field.
 * @returns {void}
 */
function formatDueDateInput(event) {
    const input = event.target;
    const cursorPosition = input.selectionStart || 0;
    const digitCount = countDigitsBeforeCursor(input.value, cursorPosition);
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    const formatted = formatDueDateDigits(digits);
    const newCursorPosition = getCursorPositionAfterFormatting(formatted, digitCount);
    input.value = formatted;
    restoreInputCursor(input, newCursorPosition);
}

/**
 * Counts numeric characters before the current cursor position.
 *
 * @param {string} value - Current input value.
 * @param {number} cursorPosition - Current cursor position.
 * @returns {number} Number of digits before the cursor.
 */
function countDigitsBeforeCursor(value, cursorPosition) {
    return value.slice(0, cursorPosition).replace(/\D/g, '').length;
}

/**
 * Formats up to eight due-date digits as DD/MM/YYYY.
 *
 * @param {string} digits - Numeric due-date value.
 * @returns {string} Formatted due-date value.
 */
function formatDueDateDigits(digits) {
    if (digits.length >= 5) {
        return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}

/**
 * Finds the cursor position after keeping the same digit offset.
 *
 * @param {string} formattedValue - Formatted due-date value.
 * @param {number} digitCountBeforeCursor - Digit count before formatting.
 * @returns {number} Cursor position in the formatted value.
 */
function getCursorPositionAfterFormatting(formattedValue, digitCountBeforeCursor) {
    let digitsFound = 0;
    if (digitCountBeforeCursor === 0) return 0;
    for (let i = 0; i < formattedValue.length; i++) {
        if (/\d/.test(formattedValue[i])) digitsFound++;
        if (digitsFound === digitCountBeforeCursor) return i + 1;
    }
    return formattedValue.length;
}

/**
 * Restores a collapsed cursor selection in an input.
 *
 * @param {HTMLInputElement} input - Input whose cursor should be restored.
 * @param {number} position - Cursor position to restore.
 * @returns {void}
 */
function restoreInputCursor(input, position) {
    input.setSelectionRange(position, position);
}


/**
 * Copies the native picker value into the visible DD/MM/YYYY field.
 *
 * @param {Event} event - Change event from the hidden date picker.
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @returns {void}
 */
function syncPickerDateToTextInput(event, input) {
    if (!event.target.value) return;
    const [year, month, day] = event.target.value.split('-');
    input.value = `${day}/${month}/${year}`;
    validateDueDate(input);
}


/**
 * Validates the due-date field and toggles its error state.
 *
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @returns {void}
 */
function validateDueDate(input) {
    const error = document.getElementById('taskDueDateError');
    if (!input.value.trim()) {
        showDueDateError(input, error, 'This field is required');
        return;
    }
    const selected = new Date(`${ddmmyyyyToISO(input.value)}T00:00:00`);
    if (isPastDate(selected)) {
        showDueDateError(input, error, 'Please select today or a future date');
        return;
    }
    toggleRequiredError(input, error, false);
}


/**
 * Shows a due-date validation message and marks the input invalid.
 *
 * @param {HTMLInputElement} input - Visible due-date text input.
 * @param {HTMLElement} error - Due-date error message element.
 * @param {string} message - Validation message to display.
 * @returns {void}
 */
function showDueDateError(input, error, message) {
    error.textContent = message;
    toggleRequiredError(input, error, true);
}


/**
 * Returns today's date as YYYY-MM-DD using the local timezone.
 *
 * @returns {string} Local ISO-like date string.
 */
function getLocalISODate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


/**
 * Returns today's local midnight.
 *
 * @returns {Date} Date object at local day start.
 */
function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}


/**
 * Checks whether a date is before today's local day start.
 *
 * @param {Date} date - Date to compare.
 * @returns {boolean} Whether the date is in the past.
 */
function isPastDate(date) {
    return date < getTodayStart();
}


/**
 * Opens the native date picker for the hidden due-date input.
 *
 * @returns {void}
 */
function openDueDatePicker() {
    const picker = document.getElementById('taskDueDatePicker');
    if (picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
}


/* ── Clear ── */
/**
 * Richtet den Clear-Button ein.
 *
 * @returns {void}
 */
function setupClearButton() {
    const clearButton = document.querySelector('.add_task_btn_clear');
    clearButton.addEventListener('click', clearTaskForm);
}


/**
 * Setzt alle Formularfelder, den State und die UI zurück.
 *
 * @returns {void}
 */
function clearTaskForm() {
    resetTaskFormElement();
    resetTaskFormState();
    resetTaskRenderedLists();
    resetPriorityButtons();
    resetCategoryDropdown();
    resetFormErrors();
}


/**
 * Resets the add-task form element.
 *
 * @returns {void}
 */
function resetTaskFormElement() {
    document.querySelector('.add_task_columns').reset();
}


/**
 * Clears task-related in-memory form state.
 *
 * @returns {void}
 */
function resetTaskFormState() {
    taskSubtasks = [];
    selectedContacts = [];
}


/**
 * Re-renders task lists and selected contact avatars.
 *
 * @returns {void}
 */
function resetTaskRenderedLists() {
    renderSubtaskList();
    renderAssignedOptions();
    renderSelectedAvatars();
}


/**
 * Clears priority button states and restores the default priority.
 *
 * @returns {void}
 */
function resetPriorityButtons() {
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    setDefaultPriority();
}


/**
 * Resets the custom category dropdown to its initial state.
 *
 * @returns {void}
 */
function resetCategoryDropdown() {
    const category = document.getElementById('taskCategory');
    const placeholder = document.getElementById('categoryPlaceholder');
    const options = document.getElementById('categoryOptions');
    const arrow = document.getElementById('categoryArrow');
    const trigger = document.querySelector('#categoryDropdown .assigned_trigger');

    if (category) category.value = '';
    if (placeholder) placeholder.textContent = 'Select task category';
    document.querySelectorAll('#categoryOptions .assigned_option_active').forEach(removeCategoryActiveState);
    options?.classList.add('hidden');
    arrow?.classList.remove('rotated');
    trigger?.setAttribute('aria-expanded', 'false');
}


/**
 * Removes the active marker from one category option.
 *
 * @param {HTMLElement} option - Category option to reset.
 * @returns {void}
 */
function removeCategoryActiveState(option) {
    option.classList.remove('assigned_option_active');
}


/**
 * Hides form errors and removes invalid input markers.
 *
 * @returns {void}
 */
function resetFormErrors() {
    document.querySelectorAll('.field_error').forEach(hideFieldError);
    document.querySelectorAll('.input_invalid').forEach(removeInvalidMarker);
}


/**
 * Hides one field error element.
 *
 * @param {HTMLElement} element - Error element to hide.
 * @returns {void}
 */
function hideFieldError(element) {
    element.classList.remove('visible');
}


/**
 * Removes the invalid marker from one element.
 *
 * @param {HTMLElement} element - Element to mark valid again.
 * @returns {void}
 */
function removeInvalidMarker(element) {
    element.classList.remove('input_invalid');
}
// 
