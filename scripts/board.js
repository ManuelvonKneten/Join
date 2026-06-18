/**
 * Enthält alle Tasks, die aus Firebase geladen wurden.
 * @type {Array<Object>}
 */
let taskEditSubtasks = [];
let allTasks = [];
let currentTaskId = null;
let selectedEditContacts= [];

/**
 * Speichert die ID des aktuell gezogenen Tasks für Drag & Drop.
 * @type {string}
 */
let currentDraggedTask;

document.addEventListener('DOMContentLoaded', initBoard);


/**
 * Initialisiert das Board und lädt alle Tasks.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initBoard() {
    await loadTasks();
}


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
 * Reagiert auf Eingaben im Suchfeld,
 * filtert die Tasks nach Titel oder Beschreibung
 * und rendert anschließend nur die gefundenen Tasks.
 *
 * @returns {void}
 */
document.getElementById('search').addEventListener('input', searchTask)
document.getElementById('search_icon').addEventListener('click', searchTask)


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
 * Schließt das Task-Detail-Popup.
 *
 * @returns {void}
 */
function closeTaskPopUp() {
   document.getElementById('dialogTask').close();
}


function handleDialogClick(event) {
    const dialog = document.getElementById('dialogTask');
    if (event.target === dialog) {
        dialog.close();
    }   
}
const dialogTask = document.getElementById('dialogTask');
dialogTask.addEventListener('click', handleDialogClick);


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
 * Schließt das "Add Task" Popup.
 *
 * @returns {void}
 */
function closeAddTaskPopUp() {
    document.getElementById('dialog_add_task_board').close();
}


function handleDialogAddTaskBoard (event) {
      if (event.target === dialog_add_task_board) {
            dialog_add_task_board.close();
        }
}
dialog_add_task_board.addEventListener('click', handleDialogAddTaskBoard);


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


/**
 * Schließt das Delete-Confirm-Popup.
 *
 * @returns {void}
 */
function closeDeleteTask() {
    document.getElementById('delete_task').close();
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
 * Aktiviert Drag & Drop visuelle Effekte (CSS Klassen).
 * Fügt Events für Dragstart und Dragend hinzu.
 *
 * @returns {void}
 */
function enableDragEffect() {
    const container = document.getElementById(`.taskContainer`);

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
 * Öffnet das Edit-Task Popup und lädt die Task-Daten in das Formular.
 *
 * @param {string} taskId - ID des Tasks
 * @returns {void}
 */
function openEditTaskPopup(taskId) {
    const task = allTasks.find(t => t.id === taskId);

    taskEditSubtasks = Array.isArray(task.subtasks) 
    ? [...task.subtasks] : [];

    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getEditTaskTemplate(task);
    dialogTask.showModal();
     renderSubtasksEdit();

    setupPriorityIcon();
    updatePriorityIcon(); 
}



function updatePriorityIcon() {
    const icon = document.getElementById("editPriorityIcon");
    const select = document.getElementById("editPriority");

    if (icon && select) {
        icon.src = `../assets/icons/${select.value}.svg`;
    }
}


/**
 * Initialisiert EventListener für das Priority Icon
 * im Edit-Popup (ändert Icon je nach Auswahl).
 *
 * @returns {void}
 */
function setupPriorityIcon() {
    const select = document.getElementById("editPriority");
    const icon = document.getElementById("editPriorityIcon");

    select.onchange = () => {
        icon.src = `../assets/icons/${select.value}.svg`;
    };
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
    task.priority = document.getElementById("editPriority").value;
    task.subtasks = taskEditSubtasks;

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
 * Rendert Subtasks im Task-Detail Popup.
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks
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
 * Toggle für Subtask (completed / not completed) und speichert in Firebase.
 *
 * @param {string} taskId - Task ID
 * @param {number} subtaskIndex - Index des Subtasks
 * @returns {void}
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




function renderSubtasksEdit() {
    const container = document.getElementById('editSubtasks');

    container.innerHTML = '';
    taskEditSubtasks.forEach((subtask, index) => {
        container.innerHTML += getSubtasksEditTemplate(subtask, index)
    });
}
   

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

function deleteSubtask(index){
    taskEditSubtasks.splice(index, 1);
    renderSubtasksEdit();
}


function editSubtask(index) {
        taskEditSubtasks[index].isEditing = true;
        renderSubtasksEdit();

    
    if(!newTitle || !newTitle.trim()) return;

    taskEditSubtasks[index].title = newTitle.trim();

    renderSubtasksEdit();
}


function handleSubtaskEnter(event) {
    if (event.key === "Enter") {
         event.preventDefault();
        addEditSubtask();
    }
}


function openEditTask(taskId) {
    const task = allTasks.find(task => task.id === taskId);

    taskEditSubtasks = [...task-subtasks];
    
    renderSubtasksEdit();
}

function saveSubtask(index){
    const input = document.getElementById(`subtaskInput${index}`);

    taskEditSubtasks[index].title = input.value.trim();
    taskEditSubtasks[index].isEditing = false;

    renderSubtasksEdit();
}




