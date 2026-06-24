                                       /* --- Utils --- *//**
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
 * Berechnet den Fortschritt der Subtasks.
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks.
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
 * Erstellt die HTML-Ausgabe für die Fortschrittsanzeige.
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks.
 * @returns {string} HTML-String.
 */
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
    if(!contacts || contacts.length === 0){
        return '';
    }
    let html = '';

    if (!Array.isArray(contacts)) {
        contacts = [contacts];
    }

    for (const entry of contacts) {
        const contact = availableContacts.find(c => c.id === entry);
        const name = contact ? contact.name : entry;
        html += getContactsAvatar(name, showName);
    }
    return html;
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
 * Öffnet einen Task per Tastatur und aktiviert
 * den Keyboard-DnD-Modus.
 *
 * @param {KeyboardEvent} event - Tastaturereignis.
 * @param {string} taskId - ID des Tasks.
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
 * Zuordnung von Pfeiltasten zu Board-Statuswerten.
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
 * Verarbeitet Tastatursteuerung für das Board.
 * Unterstützt Escape zum Abbrechen und
 * Pfeiltasten zum Verschieben von Tasks.
 *
 * @param {KeyboardEvent} event - Tastaturereignis.
 * @returns {void}
 */
function handleKeyboardBoard(event){
    if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return;
    }

    if (event.key === "Escape" && keyboardDraggedTaskId) {
        const card = document.querySelector(`[data-id="${keyboardDraggedTaskId}"]`);

        if(card) {
            card.classList.remove("keyboard-selected", "dragging-keyboard");
        }

        keyboardDraggedTaskId = null;
        keyboardModeActive = false;
        return;
    }

    if(!keyboardDraggedTaskId || !keyboardModeActive) return;

    if(KEY_MOVES[event.key]){
        event.preventDefault();
        moveKeyboardTask(KEY_MOVES[event.key]);
    }
  
}

document.addEventListener("keydown", handleKeyboardBoard);


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

