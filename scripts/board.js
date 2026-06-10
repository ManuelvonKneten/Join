
/**
 * Enthält alle Tasks, die aus Firebase geladen wurden.
 * @type {Array<Object>}
 */
let allTasks = [];

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
     renderEmptyCards()
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
    let container;

    switch (task.status) {
        case 'todo':
            container = document.querySelector('#toDo .task_field');
            break;

        case 'inprogress':
            container = document.querySelector('#InProgress .task_field');
            break;

        case 'awaitfeedback':
            container = document.querySelector('#awaitFeedback .task_field');
            break;

        case 'done':
            container = document.querySelector('#done .task_field');
            break;
    }

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
 * Filtert die geladenen Tasks anhand des Suchbegriffs
 * im Titel oder in der Beschreibung und rendert
 * anschließend die gefilterte Liste.
 *
 * @returns {void}
 */
function searchTask() {
    let input = document.getElementById('search').value.toLowerCase();
    let filteredTasks = allTasks.filter(task => task.title.toLowerCase().includes(input) ||
    task.description.toLowerCase().includes(input)
 );
 renderBoard(filteredTasks);
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


function openTaskPopUp(taskId) {
  
    const task = allTasks.find(task => task.id === taskId);
    
    const dialogTask = document.getElementById('dialogTask');
    dialogTask.innerHTML = getTaskDetailsTemplate(task);
    dialogTask.showModal(); 
    dialogTask.focus();
}


function closeTaskPopUp() {
   document.getElementById('dialogTask').close();
}

dialogTask.addEventListener('click', (event) => {
    if (event.target === dialogTask) {
        dialogTask.close();
    }
});


function getAssingnedContacts(contacts, showName = true) {

    let html = '';

    if (!Array.isArray(contacts)) {
        contacts = [contacts];
    }

    for (const name of contacts) {  
    
        html += `
            <div class="contact_task">
                <div class="contact_avatar"
                    style="background-color:${avatarColor(name)}">
                    ${initials(name)}
                </div>
                ${showName ? `<span>${name}</span>` : ''} 
            </div>
        `;
    }
    return html;
}