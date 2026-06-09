/* ── State ── */
let availableContacts = [];
let selectedContacts = [];
let selectedPriority = '';
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
    await loadAvailableContacts();
    setupPriorityButtons();
    setupSubtaskInput();
    setupClearButton();
    setupAssignedDropdown();
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
        renderAssignedOptions();
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
function setupAssignedDropdown() {
    document.addEventListener('click', (event) => {
        if (!document.getElementById('assignedDropdown').contains(event.target)) {
            closeAssignedDropdown();
        }
    });
}

/**
 * Öffnet oder schließt das Assigned-Dropdown.
 *
 * @returns {void}
 */
function toggleAssignedDropdown() {
    const options = document.getElementById('assignedOptions');
    options.classList.contains('hidden') ? openAssignedDropdown() : closeAssignedDropdown();
}

/**
 * @param {boolean} isOpen
 * @returns {void}
 */
function setAssignedDropdownOpen(isOpen) {
    document.getElementById('assignedOptions').classList.toggle('hidden', !isOpen);
    document.getElementById('assignedArrow').classList.toggle('rotated', isOpen);
}

/** @returns {void} */
function openAssignedDropdown()  { setAssignedDropdownOpen(true);  }

/** @returns {void} */
function closeAssignedDropdown() { setAssignedDropdownOpen(false); }

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

/**
 * @param {{ id: string, name: string }} contact
 * @returns {string}
 */
function assignedOptionHTML(contact) {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    return `
        <li class="assigned_option ${isSelected ? 'assigned_option_active' : ''}"
            onclick="toggleContactSelection(event, '${contact.id}')">
            <div class="assigned_option_avatar" style="background-color: ${avatarColor(contact.name)}">
                ${initials(contact.name)}
            </div>
            <span class="assigned_option_name">${contact.name}</span>
            <input type="checkbox" class="assigned_option_checkbox" ${isSelected ? 'checked' : ''} tabindex="-1">
        </li>
    `;
}

/**
 * Rendert die Initialen-Avatare der ausgewählten Kontakte unterhalb des Dropdowns.
 *
 * @returns {void}
 */
function renderSelectedAvatars() {
    document.getElementById('assignedAvatars').innerHTML = selectedContacts
        .map(contact => `
            <div class="assigned_selected_avatar" style="background-color: ${avatarColor(contact.name)}">
                ${initials(contact.name)}
            </div>
        `)
        .join('');
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
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
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
    document.getElementById('addSubtaskIcon').addEventListener('click', addSubtask);

    subtaskInputElement.addEventListener('keydown', (keyEvent) => {
        if (keyEvent.key === 'Enter') {
            keyEvent.preventDefault();
            addSubtask();
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

    taskSubtasks.push({ title: subtaskTitle, done: false });
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
 * Rendert alle Subtasks als Listeneinträge mit Löschen-Button.
 *
 * @returns {void}
 */
function renderSubtaskList() {
    document.getElementById('subtaskList').innerHTML =
        taskSubtasks.map((subtask, i) => subtaskItemHTML(subtask, i)).join('');
}

/**
 * @param {{ title: string, done: boolean }} subtask
 * @param {number} index
 * @returns {string} HTML-String des Subtask-Listeneintrags
 */
function subtaskItemHTML(subtask, index) {
    return `
        <li class="add_task_subtask_item">
            <span>${subtask.title}</span>
            <button type="button" class="add_task_subtask_remove" onclick="removeSubtask(${index})">&#x2715;</button>
        </li>
    `;
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
 * Liest alle Formularfelder aus und gibt ein Task-Objekt zurück.
 *
 * @returns {{ title: string, description: string, dueDate: string, priority: string, assignedTo: string[], category: string, subtasks: Array, status: string }}
 */
function getTaskFormData() {
    return {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        dueDate: document.getElementById('taskDueDate').value,
        priority: selectedPriority,
        assignedTo: selectedContacts.map(c => c.name),
        category: document.getElementById('taskCategory').value,
        subtasks: taskSubtasks,
        status: 'todo'
    };
}

/**
 * Wird nach erfolgreichem Speichern aufgerufen.
 * Leitet zum Board weiter.
 *
 * @returns {void}
 */
function onTaskCreated() {
    window.location.href = '/htmls/board.html';
}


/* ── Toast ── */
/**
 * Zeigt eine Toast-Nachricht für 3 Sekunden an.
 *
 * @param {string} message
 * @param {boolean} [isError=false] - true = roter Toast
 * @returns {void}
 */
function showTaskToast(message, isError = false) {
    const toastElement = document.getElementById('addTaskToast');
    toastElement.textContent = message;
    toastElement.classList.toggle('toast_error', isError);
    toastElement.classList.add('show');
    setTimeout(() => toastElement.classList.remove('show'), 3000);
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
    selectedPriority = '';
    selectedContacts = [];

    renderSubtaskList();
    renderAssignedOptions();
    renderSelectedAvatars();
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => btn.classList.remove('active'));
}
