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


const TOUCH_DRAG_THRESHOLD = 16;
let touchDragState = null;
let touchDragInitialized = false;
let suppressTouchClickUntil = 0;
let suppressTouchClickTaskId = null;
let moveToMenuInitialized = false;


/**
 * Initialisiert Touch-Drag-&-Drop additiv zur bestehenden Desktop-Logik.
 *
 * @returns {void}
 */
function initTouchDragAndDrop() {
    if (touchDragInitialized) return;

    const board = document.getElementById('board');
    if (!board) return;

    board.addEventListener('pointerdown', handleTouchDragStart);
    document.addEventListener('pointermove', handleTouchDragMove, { passive: false });
    document.addEventListener('pointerup', handleTouchDragEnd);
    document.addEventListener('pointercancel', cancelTouchDrag);
    document.addEventListener('click', suppressClickAfterTouchDrag, true);

    touchDragInitialized = true;
}


/**
 * Merkt sich den Startpunkt eines Touch-Drags.
 *
 * @param {PointerEvent} event - Pointerdown-Event.
 * @returns {void}
 */
function handleTouchDragStart(event) {
    if (event.pointerType !== 'touch') return;
    if (event.target.closest('.move-btn, .move-menu')) return;

    const card = event.target.closest('.card');
    if (!card) return;

    touchDragState = {
        pointerId: event.pointerId,
        taskId: card.dataset.id,
        card,
        startX: event.clientX,
        startY: event.clientY,
        isDragging: false,
        highlightedField: null
    };
}


/**
 * Aktiviert Touch-Drag erst nach einer kleinen Bewegungsschwelle.
 *
 * @param {PointerEvent} event - Pointermove-Event.
 * @returns {void}
 */
function handleTouchDragMove(event) {
    if (!isCurrentTouchDrag(event)) return;

    const moveX = event.clientX - touchDragState.startX;
    const moveY = event.clientY - touchDragState.startY;
    const distance = Math.hypot(moveX, moveY);

    if (!touchDragState.isDragging && distance < TOUCH_DRAG_THRESHOLD) return;

    if (!touchDragState.isDragging) {
        startTouchDrag(event);
    }

    event.preventDefault();
    updateTouchDropHighlight(event);
}


/**
 * Beendet einen Touch-Drag und speichert den Zielstatus.
 *
 * @param {PointerEvent} event - Pointerup-Event.
 * @returns {Promise<void>}
 */
async function handleTouchDragEnd(event) {
    if (!isCurrentTouchDrag(event)) return;

    const wasDragging = touchDragState.isDragging;
    const taskId = touchDragState.taskId;
    const dropField = wasDragging ? getTouchDropField(event) : null;
    const newStatus = dropField?.dataset.status;

    if (wasDragging) {
        event.preventDefault();
        suppressNextTouchClick(taskId);
    }

    cleanupTouchDrag();

    if (wasDragging && newStatus) {
        await moveTaskToStatus(taskId, newStatus);
    }
}


/**
 * Startet den visuellen Touch-Drag-Zustand.
 *
 * @param {PointerEvent} event - Pointermove-Event.
 * @returns {void}
 */
function startTouchDrag(event) {
    touchDragState.isDragging = true;
    startDragging(touchDragState.taskId);
    touchDragState.card.classList.add('dragging', 'touch-dragging');

    if (touchDragState.card.setPointerCapture) {
        try {
            touchDragState.card.setPointerCapture(event.pointerId);
        } catch (error) {
            console.warn('Touch pointer capture failed:', error);
        }
    }
}


/**
 * Aktualisiert die hervorgehobene Zielspalte unter dem Finger.
 *
 * @param {PointerEvent} event - Pointermove-Event.
 * @returns {void}
 */
function updateTouchDropHighlight(event) {
    const dropField = getTouchDropField(event);

    if (dropField === touchDragState.highlightedField) return;

    if (touchDragState.highlightedField) {
        touchDragState.highlightedField.classList.remove('task_field_highlight');
    }

    if (dropField) {
        dropField.classList.add('task_field_highlight');
    }

    touchDragState.highlightedField = dropField;
}


/**
 * Ermittelt die Drop-Zone an der aktuellen Fingerposition.
 *
 * @param {PointerEvent} event - Pointer-Event.
 * @returns {HTMLElement|null} Task-Feld oder null.
 */
function getTouchDropField(event) {
    const elementAtPointer = document.elementFromPoint(event.clientX, event.clientY);

    return elementAtPointer?.closest('.task_field') || null;
}


/**
 * Bricht einen laufenden Touch-Drag ab.
 *
 * @param {PointerEvent} event - Pointercancel-Event.
 * @returns {void}
 */
function cancelTouchDrag(event) {
    if (!isCurrentTouchDrag(event)) return;

    cleanupTouchDrag();
}


/**
 * Raeumt Klassen und Highlighting nach Touch-Drag auf.
 *
 * @returns {void}
 */
function cleanupTouchDrag() {
    if (!touchDragState) return;

    touchDragState.card.classList.remove('dragging', 'touch-dragging');

    if (touchDragState.highlightedField) {
        touchDragState.highlightedField.classList.remove('task_field_highlight');
    }

    touchDragState = null;
}


/**
 * Prueft, ob ein Pointer-Event zum aktuellen Touch-Drag gehoert.
 *
 * @param {PointerEvent} event - Pointer-Event.
 * @returns {boolean}
 */
function isCurrentTouchDrag(event) {
    return Boolean(
        touchDragState &&
        event.pointerType === 'touch' &&
        event.pointerId === touchDragState.pointerId
    );
}


/**
 * Merkt sich, dass der naechste Click nach Touch-Drag ignoriert wird.
 *
 * @param {string} taskId - Firebase-ID des Tasks.
 * @returns {void}
 */
function suppressNextTouchClick(taskId) {
    suppressTouchClickUntil = Date.now() + 500;
    suppressTouchClickTaskId = taskId;
}


/**
 * Verhindert, dass nach einem Touch-Drag direkt das Task-Popup oeffnet.
 *
 * @param {MouseEvent} event - Click-Event.
 * @returns {void}
 */
function suppressClickAfterTouchDrag(event) {
    if (Date.now() > suppressTouchClickUntil) return;

    const card = event.target.closest('.card');
    if (!card || card.dataset.id !== suppressTouchClickTaskId) return;

    event.preventDefault();
    event.stopPropagation();
    suppressTouchClickUntil = 0;
    suppressTouchClickTaskId = null;
}


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
 * Erstellt die HTML-Ausgabe für die Fortschrittsanzeige.
 *
 * @param {Array<Object>} [subtasks=[]] - Liste der Subtasks.
 * @returns {string} HTML-String.
 */
function getProgressTemplate(subtasks = []) {
    const progress = getProgress(subtasks);
    return progressHTML(progress);
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
