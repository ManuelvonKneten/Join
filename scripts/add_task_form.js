/**
 * @file Handles add-task validation, submit and clear behavior.
 */

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
