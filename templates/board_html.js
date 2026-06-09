
function getTaskTemplate(task) {
  return `
     <div draggable="true" ondragstart="startDragging('${task.id}')" class="card"
     onclick="openTaskPopUp('${task.id}')">
        <div  class="${task.category}">
        ${formatCategory(task.category)}
        </div>
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
     <div class="dialog_content">

          <div class="dialog_header">
            <div class="${task.category}">
            ${formatCategory(task.category)}
            </div>
            <button onclick="closeTaskPopUp()">
              <img src="../assets/icons/close_icon.svg" alt="close icon">
            </button>
          </div>
  
        <h2>${task.title}</h2>
  
        <div class="description">${task.description}</div>
  
        <div class="dialog_row">
          <p>Due date:</p>
          <span> ${task.dueDate}</span>
        </div>
  
        <div class="dialog_row">
          <p>Priority:</p>
          <span>
            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            <img src="../assets/icons/${task.priority}.svg" alt="${task.priority}">
          </span>
        </div>
  
        <div class="dialog_assigned">
          <p>Assigned To:</p>
          <div class="contact">
            <div class="contact_avatar">EM</div>
            <span>${task.assignedTo}</span>
          </div>
        </div>  

        <div class="dialog_subtasks">
          <p>Subtasks</p>
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