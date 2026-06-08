
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

function getTaskDetailsTemplate(task) {
  return `
       
    <div class="task_dialog">

      <div class="dialog_header">
        <button class="${task.category}">
          ${formatCategory(task.category)}
        </button>

        <button onclick="closeDialog()">
          <img src="../assets/icons/close_icon.svg" alt="close icon">
        </button>
      </div>

      <h2>${task.title}</h2>

      <p>${task.description}</p>

      <div class="dialog_row">
        <span>Due date:</span>
        <span>${task.dueDate}</span>
      </div>

      <div class="dialog_row">
        <span>Priority:</span>
        <span>
          ${task.priority}
          <img src="../assets/icons/${task.priority}.svg" alt="${task.priority}">
        </span>
      </div>

      <div class="dialog_assigned">
        <span>Assigned To:</span>

        <div class="contact">
          <div class="contact_badge">EM</div>
          <span>Emmanuel Mauer</span>
        </div>

        <div class="contact">
          <div class="contact_badge">MB</div>
          <span>Marcel Bauer</span>
        </div>

        <div class="contact">
          <div class="contact_badge">AM</div>
          <span>Anton Mayer</span>
        </div>
      </div>

      <div class="dialog_subtasks">
        <span>Subtasks</span>

        <label>
          <input type="checkbox" checked>
          Implement Recipe Recommendation
        </label>

        <label>
          <input type="checkbox">
          Start Page Layout
        </label>
      </div>

      <div class="dialog_footer">
        <button onclick="deleteTask('${task.id}')">
           <img src="../assets/icons/delete.png" alt="delete icon">Delete 
        </button>

        <button onclick="editTask('${task.id}')">
           <img class="edit_icon" src="../assets/icons/edit.png" alt="edit icon">Edit
        </button>
      </div>
    </div>
  `;
}