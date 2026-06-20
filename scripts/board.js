/* ---  State / Globals --- */
let taskEditSubtasks = [];
let allTasks = [];
let currentTaskId = null;
let selectedEditContacts= [];
let currentDraggedTask;
let selectedEditPriority = '';

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
 * Löscht einen Task aus Firebase und aus dem lokalen State.
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


/**
 * Speichert die bearbeiteten Task-Daten in Firebase.
 *
 * @async
 * @param {string} taskId - ID des Tasks
 * @returns {Promise<void>}
 */
async function saveTaskEdit(taskId) {
    const task = allTasks.find(t => t.id === taskId);
   
    task.title = document.getElementById("editTitle").value;
    task.description = document.getElementById("editDescription").value;
    task.dueDate = document.getElementById("editDueDate").value;
    task.subtasks = taskEditSubtasks;
    task.priority = document.querySelector(".add_task_prio_btn.active")?.dataset.priority;
   
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

    await patchToDB(`tasks/${currentDraggedTask}`, { status: newStatus
    });
    await loadTasks(); 
}


/**
 * Wechselt den Status eines Subtasks (completed / not completed)
 * und speichert die Änderung in Firebase.
 *
 * @param {string} taskId - ID des Tasks
 * @param {number} subtaskIndex - Index des Subtasks im Array
 * @returns {Promise<void>}
 */
function toggleSubtask(taskId, subtaskIndex) {
    const task = allTasks.find (t => t.id === taskId);

    if (!task) {
        console.error("No task found:", taskId)
        return;
    }

    task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;
    
    fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({subtasks: task.subtasks})
    });

    openTaskPopUp(taskId);
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
 * @param {Array<Object>} subtasks - Liste der Subtasks
 * @param {string} taskId - ID des Tasks
 * @returns {string} HTML-String
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
        return `
            <li onclick="toggleEditContact('${contact.id}')">
                <input type="checkbox" ${checked ? "checked" : ""}>
                ${contact.name}
            </li>
        `;
    }).join("");
}


/**
 * Rendert die Avatare der ausgewählten Kontakte im Edit Popup.
 *
 * @returns {void}
 */
function renderAssignedAvatarsEdit() {
    const container = document.getElementById("assignedAvatarsEdit")
    if (!container) return;
    container.innerHTML = selectedEditContacts.map(c => getContactsAvatar(c.name, false)).join('');
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
  

/* --- Event Handlers --- */
/**
 * Event-Handler für die Task-Suche.
 * Liest den Suchbegriff aus dem Inputfeld,
 * filtert allTasks und rendert das Board neu.
 *
 * @returns {void}
 */
function searchTask() {
    let input = document.getElementById('search').value.toLowerCase();
    let filteredTasks = allTasks.filter(task => task.title.toLowerCase().includes(input) ||
    task.description.toLowerCase().includes(input)
 );
 showNoResultsAlert(filteredTasks);
 renderBoard(filteredTasks);
}


/**
 * Speichert die ID des aktuell gezogenen Tasks.
 *
 * @param {string} id - Firebase-ID des Tasks.
 * @returns {void}
 */
function startDragging(id){
    currentDraggedTask = id;
}


/**
 * Erlaubt das Ablegen eines Elements auf einer Drop-Zone.
 *
 * @param {DragEvent} ev - Das Drag-Over-Event.
 * @returns {void}
 */
function allowDrop(ev) {
  ev.preventDefault();
}



/* --- Pop-Ups --- */
/**
 * Schließt das Task-Detail-Modal beim Klick außerhalb des Inhalts.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleDialogClick(event) {
    const dialog = document.getElementById('dialogTask');
    if (event.target === dialog) {
        dialog.close();
    }   
}

const dialogTask = document.getElementById('dialogTask');
dialogTask.addEventListener('click', handleDialogClick);


/**
 * Öffnet das Detail-Popup eines Tasks.
 *
 * @param {string} taskId - ID des Tasks
 * @returns {void}
 */
function openTaskPopUp(taskId) {
    const task = allTasks.find(task => task.id === taskId);
    
    if(!task) return;
    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getTaskDetailsTemplate(task);
    dialogTask.showModal(); 
}


/**
 * Öffnet das Edit-Task Popup und lädt die Task-Daten in das Formular.
 *
 * @param {string} taskId - ID des Tasks
 * @returns {void}
 */
async function openEditTaskPopup(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    
    taskEditSubtasks = Array.isArray(task.subtasks) 
    ? [...task.subtasks] : [];

    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getEditTaskTemplate(task);
    dialogTask.showModal();

    setPriority(task.priority);
    renderSubtasksEdit();
    await initEditAssigned(task);
}


/**
 * Öffnet das "Add Task" Popup im Board.
 * Lädt dazu das HTML dynamisch und initialisiert das Formular.
 *
 * @async
 * @param {string} [status='todo'] - Standard-Status für den neuen Task
 * @returns {Promise<void>}
 */
async function openAddTaskPopUp(status = 'todo') {
    const response = await fetch('./add_task.html');
    let html = await response.text();

    html = html.replace('<h1 class="add_task_heading">Add Task</h1>', getNewHTMLTag());

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const content = temp.querySelector('.add_task_layout');
 
    const dialog = document.getElementById('dialog_add_task_board');
    dialog.innerHTML = content.outerHTML;
    const layout = dialog.querySelector('.add_task_layout');

    layout?.classList.add('add_task_layout_popup');
    
    window.currentTaskStatus = status;
    await initAddTask();
    dialog.showModal();
}


/**
 * Öffnet das Delete-Confirm-Popup und speichert die Task-ID.
 *
 * @param {string} taskId - ID des zu löschenden Tasks
 * @returns {void}
 */
function openDeletePopup(taskId) {
    currentTaskId = taskId;
    document.getElementById('delete_task').showModal();
}


/* --- Edit Functions---*/
/**
 * Aktiviert den Edit-Modus für einen Subtask.
 *
 * @param {number} index - Index des Subtasks
 * @returns {void}
 */
function editSubtask(index) {
        taskEditSubtasks[index].isEditing = true;
        renderSubtasksEdit();
}


/**
 * Fügt einen neuen Subtask zum Edit-Task hinzu.
 * Liest den Wert aus dem Inputfeld.
 *
 * @returns {void}
 */
function addEditSubtask() {
    const input = document.getElementById('newSubtask')
    const value = input.value.trim();
    
    if (!value) return;

    taskEditSubtasks.push({
        title: input.value,
        completed: false
    });
    renderSubtasksEdit();
    input.value = '';
}


/**
 * Löscht einen Subtask aus der Edit-Liste.
 *
 * @param {number} index - Index des Subtasks
 * @returns {void}
 */
function deleteSubtask(index){
    taskEditSubtasks.splice(index, 1);
    renderSubtasksEdit();
}


/**
 * Speichert die Bearbeitung eines Subtasks.
 *
 * @param {number} index - Index des Subtasks
 * @returns {void}
 */
function saveSubtask(index){
    const input = document.getElementById(`subtaskInput${index}`);

    taskEditSubtasks[index].title = input.value.trim();
    taskEditSubtasks[index].isEditing = false;

    renderSubtasksEdit();
}


/**
 * Initialisiert die Kontakt-Zuweisung im Edit Task Popup.
 * Lädt Kontakte und setzt bereits ausgewählte Kontakte.
 *
 * @param {Object} task - Task Objekt
 * @returns {Promise<void>}
 */
async function initEditAssigned(task) {
 
    await loadAvailableContacts();

    selectedEditContacts = availableContacts.filter(c => (task.assignedTo || []).includes(c.id));

    renderAssignedOptionsEdit();
    renderAssignedAvatarsEdit();
}


/**
 * Fügt einen Kontakt hinzu oder entfernt ihn aus der Auswahl.
 *
 * @param {string} id - Kontakt-ID
 * @returns {void}
 */
function toggleEditContact(id) {
    const contact = availableContacts.find(c => c.id === id);
    if (!contact) return;

    const index = selectedEditContacts.findIndex(c => c.id === id);

    if (index === -1) {
        selectedEditContacts.push(contact);
    } else {
        selectedEditContacts.splice(index, 1);
    }

    renderAssignedOptionsEdit();
    renderAssignedAvatarsEdit();
}



/**
 * Fügt einen Subtask hinzu, wenn Enter gedrückt wird.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleSubtaskEnter(event) {
    if (event.key === "Enter") {
         event.preventDefault();
        addEditSubtask();
    }
}


/**
 * Setzt die Priorität im UI und markiert den aktiven Button.
 *
 * @param {string} priority - z.B. "low", "medium", "urgent"
 * @returns {void}
 */
function setPriority(priority) {
    document.querySelectorAll('.add_task_prio_btn').forEach(btn => {
        const isActive = btn.dataset.priority === priority;

        btn. classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
    
    selectedEditPriority = priority;
}


/* --- Utils --- */
/**
 * Zeigt oder versteckt eine "No Results"-Meldung,
 * abhängig davon ob Tasks gefunden wurden.
 *
 * @param {Array<Object>} tasks - Gefilterte Task-Liste
 * @returns {void}
 */
function showNoResultsAlert(tasks) {
    const alertRef = document.getElementById('no_results_alert');  

    if (tasks.length === 0) {
        alertRef.innerHTML = 'No results found!';
        return;
    }
    alertRef.innerHTML = '';
}


/**
 * Fügt einer Task-Spalte die Hervorhebungs-Klasse hinzu,
 * wenn ein Task darüber gezogen wird.
 *
 * @param {string} id - Die ID der Zielspalte.
 * @returns {void}
 */
function highlight(id) {
    document.getElementById(id).classList.add('task_field_highlight');
}
 

/**
 * Entfernt die Hervorhebungs-Klasse von einer Task-Spalte.
 *
 * @param {string} id - Die ID der Zielspalte.
 * @returns {void}
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('task_field_highlight');
}

/**
 * Schließt das Task-Detail-Popup.
 *
 * @returns {void}
 */
function closeTaskPopUp() {
   document.getElementById('dialogTask').close();
}


/**
 * Schließt das "Add Task" Popup.
 *
 * @returns {void}
 */
function closeAddTaskPopUp() {
    document.getElementById('dialog_add_task_board').close();
}

/**
 * Schließt das Add-Task Modal beim Klick auf Hintergrund.
 *
 * @param {MouseEvent} event
 * @returns {void}
 */
function handleDialogAddTaskBoard (event) {
      if (event.target === dialog_add_task_board) {
            dialog_add_task_board.close();
        }
}
dialog_add_task_board.addEventListener('click', handleDialogAddTaskBoard);


/**
 * Schließt das Delete-Confirm-Popup.
 *
 * @returns {void}
 */
function closeDeleteTask() {
    document.getElementById('delete_task').close();
}


/**
 * Aktiviert Drag & Drop visuelle Effekte (CSS Klassen).
 * Fügt Events für Dragstart und Dragend hinzu.
 *
 * @returns {void}
 */
function enableDragEffect() {
    const container = document.querySelector(`.taskContainer`);

    container. addEventListener('dragstart', (event) => {
        if (event.target.classList.contains('task')) {
            event.target.classList.add('dragging');
        }
    });

    container.addEventListener('dragend', (event) => {
        if (event.target.classList.contains('task')) {
            event.target.classList.remove('dragging');
        }
    });
}


/**
 * Startet den Drag-Effekt (fügt CSS Klasse hinzu).
 *
 * @param {DragEvent} event - Dragstart Event
 * @returns {void}
 */
function startDragEffect(event) {
    
    event.currentTarget.classList.add('dragging');
}


/**
 * Beendet den Drag-Effekt (entfernt CSS Klasse).
 *
 * @param {DragEvent} event - Dragend Event
 * @returns {void}
 */
function endDragEffect(event) {
    event.currentTarget.classList.remove('dragging');
}


/**
 * Aktualisiert das Priority-Icon im Edit-Task Popup
 * basierend auf dem aktuell ausgewählten Priority-Wert.
 *
 * @returns {void}
 */
function updatePriorityIcon() {
    const icon = document.getElementById("editPriorityIcon");
    const select = document.getElementById("editPriority");

    if (icon && select) {
        icon.src = `../assets/icons/${select.value}.svg`;
    }
}


/**
 * Liest alle Subtask-Inputs aus dem DOM aus
 * und erstellt daraus ein Subtask-Array.
 *
 * @param {string} selector - CSS Selector für Input Felder
 * @returns {{title: string, completed: boolean}[]} Array von Subtasks
 */
function getSubtasksFromInputs(selector = ".edit_subtask_input") {
    const inputs = document.querySelectorAll(selector);

    const subtasks = [];

    for (const input of inputs) {
        subtasks.push({
            title: input.value,
            completed: false
        });
    }
    return subtasks;
}


/**
 * Formatiert die Kategorie für die Anzeige im UI.
 *
 * @param {string} category - Die Kategorie des Tasks.
 * @returns {string} Formatierter Kategoriename.
 */
function formatCategory(category) {

    if (category === 'user_story') {
        return 'User Story';
    }

    if (category === 'technical') {
        return 'Technical Task';
    }
    return category;
}


function getProgress(subtasks = []) {
    if(!Array.isArray(subtasks)) {
        return {
            total: 0,
            completed: 0
        };
    }
    const total = subtasks.length;
    const completed = subtasks.filter(subtask => subtask.completed).length;

    return {
        total,
        completed,
        percent: total ? (completed / total) *100 : 0
    };   
}


function getProgressTemplate(subtasks = []) {
    const progress = getProgress(subtasks);
      return `
        <div class="task_progress" title="${progress.completed} of ${progress.total} subtasks completed">
            <progress value="${progress.completed}" max="${progress.total}"></progress>

            <span>
                ${progress.completed}/${progress.total} Subtasks
            </span>
        </div>
    `;
}


/**
 * Rendert die Avatare der zugewiesenen Kontakte.
 *
 * @param {string|Array<string>} contacts - Name(n) der Kontakte
 * @param {boolean} [showName=true] - Ob der Name angezeigt werden soll
 * @returns {string} HTML-String mit Avataren
 */
function renderAssignedContacts(contacts, showName = true) {
    let html = '';

    if (!Array.isArray(contacts)) {
        contacts = [contacts];
    }

    for (const name of contacts) {  
        html += getContactsAvatar(name, showName);
    }
    return html;
}















