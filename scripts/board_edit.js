                                     /* ---  State / Globals --- */
/** @type {Array<Object>} */
let taskEditSubtasks = [];

/** @type {Array<Object>} */
let selectedEditContacts = [];

/** @type {string} */
let selectedEditPriority = '';


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
 * @async
 * @param {Object} task - Task Objekt
 * @returns {Promise<void>}
 */
async function initEditAssigned(task) {

    
    await loadAvailableContacts();

    const assigned = Array.isArray(task.assignedTo)
    ? task.assignedTo
    : (task.assignedTo ? [task.assignedTo] : []);


    selectedEditContacts = availableContacts.filter(contact => assigned.includes(contact.id));

    renderAssignedOptionsEdit();
    renderAssignedAvatarsEdit();
    setupAssignedDropdown('Edit');  
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
