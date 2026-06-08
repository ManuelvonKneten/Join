/* ── State ── */
let availableContacts = [];
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
}


/* ── Contacts ── */
/**
 * Lädt alle Kontakte aus Firebase und befüllt das Assigned-to-Dropdown.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadAvailableContacts() {
    try {
        const rawContactData = await getFromDB('contacts');
        availableContacts = [];
        if (rawContactData) {
            for (const [id, contact] of Object.entries(rawContactData)) {
                availableContacts.push({ id, ...contact });
            }
        }
        renderAssignedDropdown();
    } catch (error) {
        console.error('Contacts could not be loaded:', error);
        showTaskToast('Contacts could not be loaded.', true);
    }
}

/**
 * Rendert alle Kontakte als Optionen in das Assigned-to-Dropdown.
 *
 * @returns {void}
 */
function renderAssignedDropdown() {
    const assignedSelectElement = document.getElementById('taskAssigned');
    availableContacts.forEach(contact => {
        const optionElement = document.createElement('option');
        optionElement.value = contact.id;
        optionElement.textContent = contact.name;
        assignedSelectElement.appendChild(optionElement);
    });
}


/* ── Priority ── */
/**
 * Fügt jedem Priority-Button einen Click-Listener hinzu.
 *
 * @returns {void}
 */
function setupPriorityButtons() {
    const priorityButtons = document.querySelectorAll('.add_task_prio_btn');
    priorityButtons.forEach(button => {
        button.addEventListener('click', () => onPriorityButtonClick(button));
    });
}

/**
 * Setzt den aktiven Priority-Button und speichert die gewählte Priorität.
 *
 * @param {HTMLButtonElement} clickedButton
 * @returns {void}
 */
function onPriorityButtonClick(clickedButton) {
    const priorityButtons = document.querySelectorAll('.add_task_prio_btn');
    priorityButtons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');
    selectedPriority = clickedButton.dataset.priority;
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
    const addSubtaskIcon = document.getElementById('addSubtaskIcon');

    addSubtaskIcon.style.cursor = 'pointer';
    addSubtaskIcon.addEventListener('click', addSubtask);

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
    const taskSubtasksElement = document.getElementById('subtaskList');
    let html = '';
    for (let i = 0; i < taskSubtasks.length; i++) {
        html += subtaskItemHTML(taskSubtasks[i], i);
    }
    taskSubtasksElement.innerHTML = html;
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
 * @returns {{ title: string, description: string, dueDate: string, priority: string, assignedTo: string, category: string, subtasks: Array, status: string }}
 */
function getTaskFormData() {
    const assignedSelectElement = document.getElementById('taskAssigned');
    let assignedContactName = '';
    if (assignedSelectElement.value) {
        const selectedOption = assignedSelectElement.options[assignedSelectElement.selectedIndex];
        assignedContactName = selectedOption.textContent;
    }

    return {
        title: document.getElementById('taskTitle').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        dueDate: document.getElementById('taskDueDate').value,
        priority: selectedPriority,
        assignedTo: assignedContactName,
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
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskAssigned').value = '';
    document.getElementById('taskCategory').value = '';
    document.getElementById('subtaskInput').value = '';

    taskSubtasks = [];
    selectedPriority = '';

    renderSubtaskList();

    const priorityButtons = document.querySelectorAll('.add_task_prio_btn');
    priorityButtons.forEach(button => button.classList.remove('active'));
}
