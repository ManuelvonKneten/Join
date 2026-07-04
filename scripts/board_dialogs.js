                                       /* --- Pop-Ups --- */
let showAllTaskPopupAvatars = false;

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
 * Referenz auf das Task-Detail-Dialogelement.
 *
 * @type {HTMLDialogElement}
 */
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

    const btn = dialogTask.querySelector(".js_more_avatars");

    if (btn) {
        btn.addEventListener("click", () => showAllAssignedAvatarsTask(taskId));
    }
    dialogTask.showModal(); 
}


/**
 * Zeigt alle zugewiesenen Avatare im Task-Detail-Popup an
 * und rendert das Popup anschließend neu.
 *
 * @param {string} taskId - ID des Tasks.
 * @returns {void}
 */
function showAllAssignedAvatarsTask(taskId) {
    showAllTaskPopupAvatars = true;
    openTaskPopUp(taskId);
}

/**
 * Öffnet das Edit-Task Popup und lädt die Task-Daten in das Formular.
 *
 * @async
 * @param {string} taskId - ID des Tasks
 * @returns {Promise<void>}
 */
async function openEditTaskPopup(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    
    taskEditSubtasks = Array.isArray(task.subtasks) 
    ? [...task.subtasks] : [];

    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getEditTaskTemplate(task);
    if (!dialogTask.open) dialogTask.showModal();

    setupPriorityButtons();
    setPriority(task.priority);
    renderSubtasksEdit();
    showAllAvatarsEditTask = false;
    await initEditAssigned(task);
    renderAssignedAvatarsEdit();
    setupEditDueDateInput(task.dueDate);
}


/**
 * Initialisiert das Datumfeld im Edit-Task-Popup.
 * Befüllt den Text-Input mit DD/MM/YYYY und verdrahtet Picker + Validierung.
 *
 * @param {string} isoDate - Datum im Format YYYY-MM-DD
 * @returns {void}
 */
function setupEditDueDateInput(isoDate) {
    const input  = document.getElementById('editDueDate');
    const picker = document.getElementById('editDueDatePicker');
    const error  = document.getElementById('editDueDateError');

    picker.min = getLocalISODate();

    if (isoDate) {
        const [year, month, day] = isoDate.split('-');
        input.value = `${day}/${month}/${year}`;
    }

    input.addEventListener('keydown', handleDueDateBackspace);
    input.addEventListener('input',   formatDueDateInput);
    input.addEventListener('blur',    () => validateEditDueDate(input, error));
    picker.addEventListener('change', (e) => {
        syncPickerDateToTextInput(e, input);
        validateEditDueDate(input, error);
    });
}


/**
 * Validiert das Datumfeld im Edit-Task-Popup.
 *
 * @param {HTMLInputElement} input - Text-Input DD/MM/YYYY
 * @param {HTMLElement} error - Fehlermeldungs-Element
 * @returns {void}
 */
function validateEditDueDate(input, error) {
    if (!input.value.trim()) {
        toggleRequiredError(input, error, true);
        return;
    }
    const selected = new Date(`${ddmmyyyyToISO(input.value)}T00:00:00`);
    toggleRequiredError(input, error, isPastDate(selected));
}


/**
 * Öffnet den nativen Datepicker im Edit-Task-Popup.
 *
 * @returns {void}
 */
function openEditDueDatePicker() {
    const picker = document.getElementById('editDueDatePicker');
    if (picker.showPicker) {
        picker.showPicker();
    } else {
        picker.click();
    }
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
 * Schließt das Delete-Confirm-Popup.
 *
 * @returns {void}
 */
function closeDeleteTask() {
    document.getElementById('delete_task').close();
}


/**
 * Ändert den Status eines Subtasks und speichert die Änderung.
 *
 * @param {string} taskId - ID des Tasks.
 * @param {number} subtaskIndex - Index des Subtasks.
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

    const card = document.querySelector(`[data-id="${taskId}"]`);
    if (card) {
        card.outerHTML = getTaskTemplate(task);
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

