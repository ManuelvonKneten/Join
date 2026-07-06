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
 * Initialisiert das Board und lädt alle Tasks.
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
 * Registriert alle Event Listener für das Board.
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
 * Lädt alle Tasks aus Firebase, speichert sie im lokalen State
 * und rendert anschließend das Board.
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
 * Speichert die bearbeiteten Task-Daten in Firebase.
 *
 * @async
 * @param {string} taskId - ID des Tasks
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

    task.title = document.getElementById("editTitle").value;
    task.description = document.getElementById("editDescription").value;
    task.dueDate = isoDate;
    task.subtasks = taskEditSubtasks;
    task.priority = document.querySelector(".add_task_prio_btn.active")?.dataset.priority;
    task.assignedTo = selectedEditContacts.map(c => c.id);

    await fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    });
    closeTaskPopUp();
    await loadTasks();
    renderBoard();
}


/**
 * Verschiebt einen Task in eine andere Spalte,
 * aktualisiert den Status in Firebase
 * und lädt das Board anschließend neu.
 *
 * @async
 * @param {DragEvent} event - Das Drop-Event.
 * @returns {Promise<void>}
 */
async function moveTo(event) {

    const dropField = event.currentTarget;

    dropField.classList.remove('task_field_highlight');
    const newStatus = event.currentTarget.dataset.status;

    await moveTaskToStatus(currentDraggedTask, newStatus);
}


/**
 * Verschiebt einen Task in einen neuen Board-Status
 * und verwendet die zentrale Speicherlogik für Drag & Drop.
 *
 * @async
 * @param {string} taskId - Firebase-ID des Tasks.
 * @param {string} newStatus - Zielstatus.
 * @returns {Promise<void>}
 */
async function moveTaskToStatus(taskId, newStatus) {
    if (!taskId || !newStatus) return;

    await patchToDB(`tasks/${taskId}`, { status: newStatus
    });
    await loadTasks(); 
}


/**
 * Verschiebt den aktuell per Tastatur ausgewählten Task
 * in einen neuen Status.
 *
 * @async
 * @param {string} newStatus - Zielstatus.
 * @returns {Promise<void>}
 */
async function moveKeyboardTask(newStatus) {
    const taskId = keyboardDraggedTaskId;

    await moveTaskToStatus(taskId, newStatus);
}


                                    /* --- Render Functions --- */
/**
 * Leert alle Board-Spalten und rendert anschließend alle Tasks neu.
 *
 * @param {Array<Object>} [tasks=allTasks] - Die darzustellenden Tasks.
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
 * Rendert einen einzelnen Task in die passende Board-Spalte
 * anhand seines Status.
 *
 * @param {Object} task - Das Task-Objekt.
 * @param {string} task.id - Die Firebase-ID des Tasks.
 * @param {string} task.status - Der aktuelle Status des Tasks.
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
 * Zeigt für leere Board-Spalten eine Platzhalterkarte an.
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
 * Rendert die Subtasks im Task Detail Popup.
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks.
 * @param {string} taskId - ID des Tasks.
 * @returns {string} HTML-String.
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
 * Rendert die auswählbaren Kontakte im Edit Task Dropdown.
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
 * Rendert die Avatare der ausgewählten Kontakte im Edit Popup.
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
 * Schaltet zwischen der kompakten und vollständigen Anzeige
 * der zugewiesenen Avatare im Edit-Task-Popup um und rendert
 * die Avatar-Liste anschließend neu.
 *
 * @returns {void}
 */
function showAllAssignedAvatarsEditTask() {
    showAllAvatarsEditTask = !showAllAvatarsEditTask;
    renderAssignedAvatarsEdit();
}


/**
 * Rendert alle Subtasks im Edit-Task Popup.
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
  
