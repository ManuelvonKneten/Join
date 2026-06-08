let allTasks = [];

let currentDraggedTask;

document.addEventListener('DOMContentLoaded', initBoard);


async function initBoard() {
    await loadTasks();
}


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


function renderBoard() {
     document.querySelector('#toDo .task_field').innerHTML = '';
     document.querySelector('#InProgress .task_field').innerHTML = '';
     document.querySelector('#awaitFeedback .task_field').innerHTML = '';
     document.querySelector('#done .task_field').innerHTML = '';

     for (const task of allTasks) {
        renderTask(task);
     }
}


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


function formatCategory(category) {

    if (category === 'user_story') {
        return 'User Story';
    }

    if (category === 'technical') {
        return 'Technical Task';
    }
    return category;
}


function startDragging(id){
    currentDraggedTask = id;
}

function allowDrop(ev) {
  ev.preventDefault();
}