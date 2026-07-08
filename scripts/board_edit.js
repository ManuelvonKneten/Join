                                     /* ---  State / Globals --- */
/** @type {Array<Object>} */
let taskEditSubtasks = [];

/** @type {Array<Object>} */
let selectedEditContacts = [];

/** @type {string} */
let selectedEditPriority = '';


/* --- Edit Functions---*/
/**
 * Activates the edit mode for a subtask.
 *
 * @param {number} index - Index of the subtask
 * @returns {void}
 */
function editSubtask(index) {
        taskEditSubtasks[index].isEditing = true;
        renderSubtasksEdit();
}


/**
 * Adds a new subtask to the edit task.
 * Reads the value from the input field.
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
 * Deletes a subtask from the edit list.
 *
 * @param {number} index - Index of the subtask
 * @returns {void}
 */
function deleteSubtask(index){
    taskEditSubtasks.splice(index, 1);
    renderSubtasksEdit();
}


/**
 * Saves the edit of a subtask.
 *
 * @param {number} index - Index of the subtask
 * @returns {void}
 */
function saveSubtask(index){
    const input = document.getElementById(`subtaskInput${index}`);

    taskEditSubtasks[index].title = input.value.trim();
    taskEditSubtasks[index].isEditing = false;

    renderSubtasksEdit();
}


/**
 * Initializes the contact assignment in the edit task popup.
 * Loads contacts and sets already selected contacts.
 *
 * @async
 * @param {Object} task - Task object
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
 * Adds a contact to the selection or removes it.
 *
 * @param {string} id - Contact ID
 * @returns {void}
 */
function toggleEditContact(id) {
    const contact = availableContacts.find(c => c.id === id);
    if (!contact) return;

    const index = selectedEditContacts.findIndex(c => c.id === id);

    index === -1 ? selectedEditContacts.push(contact) : selectedEditContacts.splice(index, 1);
    
    renderAssignedOptionsEdit();
    renderAssignedAvatarsEdit();
}


/**
 * Adds a subtask when Enter is pressed.
 *
 * @param {KeyboardEvent} event
 * @returns {void}
 */
function handleEditSubtaskEnter(event) {
    if (event.key === "Enter") {
         event.preventDefault();
        addEditSubtask();
    }
}


/**
 * Sets the priority in the UI and marks the active button.
 *
 * @param {string} priority - e.g. "low", "medium", "urgent"
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
 * Updates the priority icon in the edit task popup
 * based on the currently selected priority value.
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


