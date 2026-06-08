
function getTaskTemplate(task) {
  return `
     <div draggable="true" ondragstart="startDragging('${task.id}')" class="card">

        <button class="${task.category}">
        ${formatCategory(task.category)}
        </button>
        <h4>${task.title}</h4>
        <p>${task.description}</p>
        <span>${task.priority}</span>
    </div>
    `;
}


function getEmptyCardTemplate(fieldName) {
  return `
    <div class="empty_card">
        <span>No tasks ${fieldName}</span>
    </div>
  `;
}