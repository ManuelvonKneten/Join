                                       /* --- Utils --- *//**
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


let moveToMenuInitialized = false;


/**
 * Initialisiert das Schliessen offener Move-To-Menues bei Aussenklick.
 *
 * @returns {void}
 */
function initMoveToMenu() {
    if (moveToMenuInitialized) return;

    document.addEventListener('click', closeMoveMenus);
    moveToMenuInitialized = true;
}


/**
 * Oeffnet oder schliesst das Move-To-Menue einer Task Card.
 *
 * @param {MouseEvent} event - Click-Event des Move-Buttons.
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
 * Verschiebt eine Task ueber das mobile Move-To-Menue.
 *
 * @param {MouseEvent} event - Click-Event eines Menue-Buttons.
 * @param {string} taskId - Firebase-ID des Tasks.
 * @param {string} newStatus - Zielstatus.
 * @returns {Promise<void>}
 */
async function moveTaskFromMenu(event, taskId, newStatus) {
    event.preventDefault();
    event.stopPropagation();

    closeMoveMenus();
    await moveTaskToStatus(taskId, newStatus);
}


/**
 * Schliesst alle offenen Move-To-Menues.
 *
 * @returns {void}
 */
function closeMoveMenus() {
    document.querySelectorAll('.move-menu.open').forEach(menu => {
        menu.classList.remove('open');
    });
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
 * Erstellt das HTML für die Fortschrittsanzeige der Subtasks.
 * Zeigt nichts an, wenn keine Subtasks vorhanden sind (0/0).
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks.
 * Jeder Subtask kann ein Objekt sein, z. B. { completed: true }.
 *
 * @returns {string} HTML-String für den Progress-Balken oder
 * ein leerer String, wenn keine Subtasks existieren.
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


/**
 * Kürzt einen Text auf eine maximale Länge, ohne Wörter zu zerschneiden.
 *
 * Falls der Text länger als `maxLength` ist, werden nur vollständige
 * Wörter bis zur maximalen Länge übernommen und anschließend
 * "..." angehängt.
 *
 * @param {string} text - Der zu kürzende Text.
 * @param {number} [maxLength=30] - Maximale Zeichenanzahl der Kurzversion.
 * @returns {string} Der gekürzte Text oder der Originaltext, wenn er kurz genug ist.
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
 * Wechselt per Klick zwischen der gekürzten und der vollständigen
 * Anzeige eines Titels.
 *
 * Der aktuelle Anzeigestatus wird über das `data-full`-Attribut
 * des HTML-Elements gespeichert.
 *
 * @param {HTMLElement} el - Das angeklickte HTML-Element (z. B. ein <h2>).
 * @param {string} fullText - Der vollständige Titel.
 * @returns {void}
 */
function toggleFullTitle(el, fullText) {
    if (el. dataset.full === "true") {
        el.textContent = shortenText(fullText, 30);
        el.dataset.full ="false";
    } else {
        el.textContent = fullText;
        el.dataset.full = "true";
    }
}
