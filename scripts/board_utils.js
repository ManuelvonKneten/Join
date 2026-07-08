                                       /* --- Utils --- */
/**
 * Indicates whether the "Move To" menu has already been initialized.
 *
 * @type {boolean}
 */
let moveToMenuInitialized = false;


/**
 * Starts the drag effect (adds a CSS class).
 *
 * @param {DragEvent} event - Dragstart event
 * @returns {void}
 */
function startDragEffect(event) {
    event.currentTarget.classList.add('dragging');
}


/**
 * Ends the drag effect (removes the CSS class).
 *
 * @param {DragEvent} event - Dragend event
 * @returns {void}
 */
function endDragEffect(event) {
    event.currentTarget.classList.remove('dragging');
}


/**
 * Initializes closing open move-to menus on an outside click.
 *
 * @returns {void}
 */
function initMoveToMenu() {
    if (moveToMenuInitialized) return;

    document.addEventListener('click', closeMoveMenus);
    moveToMenuInitialized = true;
}


/**
 * Opens or closes the move-to menu of a task card.
 *
 * @param {MouseEvent} event - Click event of the move button.
 * @returns {void}
 */
function toggleMoveMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    const card = event.currentTarget.closest('.card');
    const menu = card?.querySelector('.move-menu');

    if (!menu) return;

    const shouldOpen = !menu.classList.contains('open');
    closeMoveMenus();
    menu.classList.toggle('open', shouldOpen);
}


/**
 * Moves a task via the mobile move-to menu.
 *
 * @param {MouseEvent} event - Click event of a menu button.
 * @param {string} taskId - Firebase ID of the task.
 * @param {string} newStatus - Target status.
 * @returns {Promise<void>}
 */
async function moveTaskFromMenu(event, taskId, newStatus) {
    event.preventDefault();
    event.stopPropagation();

    closeMoveMenus();
    await moveTaskToStatus(taskId, newStatus);
}


/**
 * Closes all open move-to menus.
 *
 * @returns {void}
 */
function closeMoveMenus() {
    document.querySelectorAll('.move-menu.open').forEach(menu => {
        menu.classList.remove('open');
    });
}


/**
 * Formats the category for display in the UI.
 *
 * @param {string} category - The category of the task.
 * @returns {string} Formatted category name.
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
 * Calculates the progress of the subtasks.
 *
 * @param {Array<Object>} [subtasks=[]] - List of subtasks.
 * @returns {{
 *   total:number,
 *   completed:number,
 *   percent:number
 * }}
 */
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


 /**
 * Builds the HTML for the subtask progress bar.
 * Shows nothing when there are no subtasks (0/0).
 *
 * @param {Array<Object>} [subtasks=[]] - List of subtasks.
 * Each subtask can be an object, e.g. { completed: true }.
 *
 * @returns {string} HTML string for the progress bar or
 * an empty string when no subtasks exist.
 */
function getProgressTemplate(subtasks = []) {
    const progress = getProgress(subtasks);
    if (progress.total === 0) {
        return '';
    }
    return progressHTML(progress);
}


                                    /* --- Event Handlers --- */
/**
 * Event handler for the task search.
 * Reads the search term from the input field,
 * filters allTasks and re-renders the board.
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
 * Opens a task via keyboard and activates
 * the keyboard drag-and-drop mode.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 * @param {string} taskId - ID of the task.
 * @returns {void}
 */
function handleTaskKey(event, taskId){
    if (event.key === "Enter" || event.key === " "){
        event.preventDefault();

        const card = event.currentTarget;

        focusedTaskId = taskId;
        keyboardDraggedTaskId = taskId;
        keyboardModeActive = true;

        card.classList.add("keyboard-selected");

        openTaskPopUp(taskId);
    }
}


/**
 * Mapping of arrow keys to board status values.
 *
 * @type {Object<string,string>}
 */
const KEY_MOVES = {
    ArrowRight: "inprogress",
    ArrowLeft: "todo",
    ArrowDown: "awaitfeedback",
    ArrowUp: "done"
};


/**
 * Handles keyboard control for the board.
 * Supports Escape to cancel and
 * arrow keys to move tasks.
 *
 * @param {KeyboardEvent} event - Keyboard event.
 * @returns {void}
 */
function handleKeyboardBoard(event){
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") return;

    if (event.key === "Escape" && keyboardDraggedTaskId) {
        cancelKeyboardDrag();
        return;
    }

    if (!keyboardDraggedTaskId || !keyboardModeActive) return;

    if (KEY_MOVES[event.key]) {
        event.preventDefault();
        moveKeyboardTask(KEY_MOVES[event.key]);
    }
}


/**
 * Cancels the current keyboard drag selection and resets the keyboard state.
 *
 * @returns {void}
 */
function cancelKeyboardDrag() {
    const card = document.querySelector(`[data-id="${keyboardDraggedTaskId}"]`);
    if (card) card.classList.remove("keyboard-selected", "dragging-keyboard");
    keyboardDraggedTaskId = null;
    keyboardModeActive = false;
}


/**
 * Sends a PATCH request for a task to Firebase.
 *
 * @param {string} taskId - Firebase id of the task.
 * @param {Object} data - The payload to patch.
 * @returns {Promise<Response>}
 */
function patchTask(taskId, data) {
    return fetch(`${DB_URL}/tasks/${taskId}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
}

document.addEventListener("keydown", handleKeyboardBoard);


/**
 * Stores the ID of the task currently being dragged.
 *
 * @param {string} id - Firebase ID of the task.
 * @returns {void}
 */
function startDragging(id){
    currentDraggedTask = id;
}


/**
 * Allows dropping an element onto a drop zone.
 *
 * @param {DragEvent} ev - The dragover event.
 * @returns {void}
 */
function allowDrop(ev) {
  ev.preventDefault();
}


/**
 * Shows or hides a "No Results" message,
 * depending on whether tasks were found.
 *
 * @param {Array<Object>} tasks - Filtered task list
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
 * Adds the highlight class to a task column
 * when a task is dragged over it.
 *
 * @param {string} id - The ID of the target column.
 * @returns {void}
 */
function highlight(id) {
    document.getElementById(id).classList.add('task_field_highlight');
}
 

/**
 * Removes the highlight class from a task column.
 *
 * @param {string} id - The ID of the target column.
 * @returns {void}
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('task_field_highlight');
}


/**
 * Shortens a text to a maximum length without cutting words apart.
 *
 * If the text is longer than `maxLength`, only complete
 * words up to the maximum length are kept and then
 * "..." is appended.
 *
 * @param {string} text - The text to shorten.
 * @param {number} [maxLength=30] - Maximum character count of the short version.
 * @returns {string} The shortened text or the original text if it is short enough.
 */
function shortenText(text, maxLength = 30) {
    if (!text || text.length <= maxLength) return text;

    const words = text.split(' ');
    let result = '';

    for (const word of words) {
        if ( (result + ' ' + word).trim().length > maxLength) break;
        result += (result ? ' ' : '') + word;
    }
    return result + '...';
}


/**
 * Switches on click between the shortened and the full
 * display of a title.
 *
 * The current display state is stored via the `data-full` attribute
 * of the HTML element.
 *
 * The full title is read from the element's `data-title` attribute.
 *
 * @param {HTMLElement} el - The clicked HTML element (e.g. an <h2>).
 * @returns {void}
 */
function toggleFullTitle(el) {
    const fullText = el.dataset.title;
    if (el. dataset.full === "true") {
        el.textContent = shortenText(fullText, 30);
        el.dataset.full ="false";
    } else {
        el.textContent = fullText;
        el.dataset.full = "true";
    }
}
