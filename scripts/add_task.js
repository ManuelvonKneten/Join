/* ── State ── */
let availableContacts = [];
let selectedContacts = [];
let selectedPriority = 'medium';
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


function setDefaultPriority() {
    const mediumBtn = document.querySelector('.add_task_prio_btn[data-priority="medium"]');
    if (!mediumBtn) return;
    mediumBtn.classList.add('active');
    mediumBtn.setAttribute('aria-pressed', 'true');
    selectedPriority = 'medium';
}

function validateTaskForm() {
    const title    = document.getElementById('taskTitle');
    const dueDate  = document.getElementById('taskDueDate');
    const category = document.getElementById('taskCategory');

    const titleError    = document.getElementById('taskTitleError');
    const dueDateError  = document.getElementById('taskDueDateError');
    const categoryError = document.getElementById('taskCategoryError');

    let valid = true;

    toggleRequiredError(title, titleError, !title.value.trim());
    if (!title.value.trim()) valid = false;

    validateDueDate(dueDate);
    if (dueDateError.classList.contains('visible')) valid = false;

    const noCategory = !category.value;
    if (categoryError) categoryError.classList.toggle('visible', noCategory);
    document.querySelector('#categoryDropdown .assigned_trigger')
        ?.classList.toggle('input_invalid', noCategory);
    if (noCategory) valid = false;

    return valid;
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
 * @param {HTMLInputElement} field
 * @param {HTMLElement} message
 * @param {boolean} show
 * @returns {void}
 */
function toggleRequiredError(field, message, show) {
    message.classList.toggle('visible', show);
    field.classList.toggle('input_invalid', show);
}


/* ── Contacts ── */
/**
 * Lädt alle Kontakte aus Firebase und rendert das Assigned-Dropdown.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadAvailableContacts() {
    
    try {
        const rawContactData = await getFromDB('contacts');
    
        availableContacts = rawContactData
            ? Object.entries(rawContactData).map(([id, contact]) => ({ id, ...contact }))
            : [];
            
        // renderAssignedOptions();

    } catch (error) {
        console.error('Contacts could not be loaded:', error);
        showTaskToast('Contacts could not be loaded.', true);
    }
}


/**
 * Richtet den Outside-Click-Listener zum Schließen des Dropdowns ein.
 *
 * @returns {void}
 */
function setupAssignedDropdown(suffix = '') {
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('assignedDropdown' + suffix);
        if (!dropdown) return;
        if (!dropdown.contains(event.target)) {
            closeAssignedDropdown(suffix);
        }
    });
}

/**
 * Öffnet oder schließt das Assigned-Dropdown.
 *
 * @returns {void}
 */
function toggleCategoryDropdown() {
    const options = document.getElementById('categoryOptions');
    const isHidden = options.classList.contains('hidden');
    options.classList.toggle('hidden', !isHidden);
    document.getElementById('categoryArrow').classList.toggle('rotated', isHidden);
    document.querySelector('#categoryDropdown .assigned_trigger').setAttribute('aria-expanded', String(isHidden));
}

function selectCategory(value, label, el) {
    document.getElementById('taskCategory').value = value;
    document.getElementById('categoryPlaceholder').textContent = label;
    document.querySelectorAll('#categoryOptions .assigned_option').forEach(opt => opt.classList.remove('assigned_option_active'));
    el.classList.add('assigned_option_active');
    document.getElementById('categoryOptions').classList.add('hidden');
    document.getElementById('categoryArrow').classList.remove('rotated');
    document.getElementById('taskCategoryError')?.classList.remove('visible');
    document.querySelector('#categoryDropdown .assigned_trigger')?.classList.remove('input_invalid');
}

/**
 * Öffnet oder schließt ein Assigned-Dropdown.
 * Wird von Add-Task (ohne Argument) und vom Edit-Popup (suffix = 'Edit') genutzt.
 *
 * @param {string} [suffix=''] - ID-Zusatz, z.B. 'Edit' für das Edit-Popup
 * @returns {void}
 */
function toggleAssignedDropdown(suffix = '') {
    const dropdown = document.getElementById('assignedDropdown' + suffix);
    if (!dropdown) return;

    const list = document.getElementById('assignedOptions' + suffix);
    const arrow = dropdown.querySelector('.assigned_arrow');

    list.classList.toggle('hidden');
    dropdown.classList.toggle('open');
    if (arrow) arrow.classList.toggle('rotated');
}

/**
 * @param {boolean} isOpen
 * @returns {void}
 */
function setAssignedDropdownOpen(isOpen) {
    document.getElementById('assignedOptions').classList.toggle('hidden', !isOpen);
    document.getElementById('assignedArrow').classList.toggle('rotated', isOpen);
    document.querySelector('#assignedDropdown .assigned_trigger').setAttribute('aria-expanded', String(isOpen));
}

/** @returns {void} */
function openAssignedDropdown()  { setAssignedDropdownOpen(true);  }

/**
 * Schließt ein Assigned-Dropdown.
 *
 * @param {string} [suffix=''] - ID-Zusatz, z.B. 'Edit' für das Edit-Popup
 * @returns {void}
 */
function closeAssignedDropdown(suffix = '') {
    const dropdown = document.getElementById('assignedDropdown' + suffix);
    if (!dropdown) return;
    document.getElementById('assignedOptions' + suffix)?.classList.add('hidden');
    dropdown.classList.remove('open');
    dropdown.querySelector('.assigned_arrow')?.classList.remove('rotated');
}

/**
 * Fügt einen Kontakt zur Auswahl hinzu oder entfernt ihn daraus.
 *
 * @param {string} contactId
 * @returns {void}
 */
function toggleContactSelection(event, contactId) {
    event.stopPropagation();

    const contact = availableContacts.find(c => c.id === contactId);
    if (!contact) return;

    const index = selectedContacts.findIndex(c => c.id === contactId);
    if (index === -1) {
        selectedContacts.push(contact);
    } else {
        selectedContacts.splice(index, 1);
    }
    renderAssignedOptions();
    renderSelectedAvatars();

    const refocusItem = document.querySelector(`#assignedOptions [data-id="${contactId}"]`);
    if (refocusItem) refocusItem.focus();
}

/**
 * Rendert alle Kontakte als auswählbare Listeneinträge im Dropdown.
 *
 * @returns {void}
 */
function renderAssignedOptions() {
    document.getElementById('assignedOptions').innerHTML =
    availableContacts.map(contact => assignedOptionHTML(contact)).join('');
}


function renderSelectedAvatars(){
    const html = buildAvatarsHTML(
        selectedContacts.map(c => c.id), 
        availableContacts,
        showAllAvatarsAddTask
    );

    const container = document.getElementById("assignedAvatars");
    container.innerHTML = html;

    const btn = container.querySelector(".js_more_avatars");
    if (btn) {
        btn.addEventListener("click", showAllAssignedAvatarsAddTask);
    }
}


function showAllAssignedAvatarsAddTask() {
    showAllAvatarsAddTask = !showAllAvatarsAddTask;
    renderSelectedAvatars();
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


/* ── Subtasks ── */
/**
 * Richtet das Subtask-Input ein:
 * Icon-Klick und Enter-Taste fügen einen neuen Subtask hinzu.
 *
 * @returns {void}
 */
function setupSubtaskInput() {
    const subtaskInputElement = document.getElementById('subtaskInput');

    document.getElementById('clearSubtaskBtn').addEventListener('click', () => {
        subtaskInputElement.value = '';
        subtaskInputElement.focus();
    });
    document.getElementById('confirmSubtaskBtn').addEventListener('click', addSubtask);

    subtaskInputElement.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Enter') {
            keyEvent.preventDefault();
            addSubtask();
        }
        if (keyEvent.key === 'Escape') {
            subtaskInputElement.value = '';
            subtaskInputElement.blur();
        }
    });
}

/**
 * Liest den Subtask-Input aus, fügt den Subtask zum State hinzu und rendert die Liste.
 *
 * @returns {void}
 */
function addSubtask() {
    const subtaskInputElement = document.getElementById('subtaskInput');
    const subtaskTitle = subtaskInputElement.value.trim();
    if (!subtaskTitle) return;

    taskSubtasks.push({ title: subtaskTitle, completed: false });
    subtaskInputElement.value = '';
    renderSubtaskList();
}

/**
 * Entfernt einen Subtask anhand seines Index aus dem State und rendert die Liste neu.
 *
 * @param {number} subtaskIndex
 * @returns {void}
 */
function removeSubtask(subtaskIndex) {
    taskSubtasks.splice(subtaskIndex, 1);
    renderSubtaskList();
}


/**
 * Aktiviert den Bearbeitungsmodus
 * eines Subtasks.
 *
 * @param {number} index - Index des Subtasks.
 * @returns {void}
 */
function editSubtaskItem(index) {
    taskSubtasks[index].isEditing = true;
    renderSubtaskList();
    document.getElementById(`subtaskEdit${index}`)?.focus();
}

function saveSubtaskItem(index) {
    const input = document.getElementById(`subtaskEdit${index}`);
    const val = input?.value.trim();
    if (val) taskSubtasks[index].title = val;
    taskSubtasks[index].isEditing = false;
    renderSubtaskList();
}

function cancelSubtaskEdit(index) {
    taskSubtasks[index].isEditing = false;
    renderSubtaskList();
}

/**
 * Rendert alle Subtasks als Listeneinträge mit Löschen-Button.
 *
 * @returns {void}
 */
function renderSubtaskList() {
    document.getElementById('subtaskList').innerHTML =
        taskSubtasks.map((subtask, i) => subtaskItemHTML(subtask, i)).join('');
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
    const submitButton = submitEvent.target.querySelector('.add_task_btn_create');
    submitButton.disabled = true;
    submitButton.textContent = 'Saving…';

    try {
        await postToDB('tasks', taskData);
        onTaskCreated();
    } catch (error) {
        console.error('Task could not be saved:', error);
        submitButton.disabled = false;
        submitButton.innerHTML = 'Create Task <span>&#x2713;</span>';
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
 * @returns {{ title: string, description: string, dueDate: string, priority: string, assignedTo: string[], category: string, subtasks: Array, status: string }}
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
 */
function setupDueDateInput() {
    const input  = document.getElementById('taskDueDate');
    const picker = document.getElementById('taskDueDatePicker');

    picker.min = new Date().toISOString().split('T')[0];

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            const v = input.value;
            if (v.endsWith('/')) input.value = v.slice(0, -1);
        }
    });

    input.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;
        if (digits.length >= 3) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
        if (digits.length >= 5) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
        e.target.value = formatted;
    });

    picker.addEventListener('change', (e) => {
        if (!e.target.value) return;
        const [year, month, day] = e.target.value.split('-');
        input.value = `${day}/${month}/${year}`;
        validateDueDate(input);
    });

    input.addEventListener('blur', () => validateDueDate(input));
}

function validateDueDate(input) {
    const error = document.getElementById('taskDueDateError');
    if (!input.value.trim()) {
        error.textContent = 'This field is required';
        toggleRequiredError(input, error, true);
        return;
    }
    const selected = new Date(ddmmyyyyToISO(input.value));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
        error.textContent = 'Please select today or a future date';
        toggleRequiredError(input, error, true);
    } else {
        toggleRequiredError(input, error, false);
    }
}

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
    document.querySelector('.add_task_columns').reset();

    taskSubtasks = [];
    selectedContacts = [];

    renderSubtaskList();
    renderAssignedOptions();
    renderSelectedAvatars();
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    setDefaultPriority();
    document.querySelectorAll('.field_error').forEach(el => el.classList.remove('visible'));
    document.querySelectorAll('.input_invalid').forEach(el => el.classList.remove('input_invalid'));
}
// 
