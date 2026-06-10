
function getTaskTemplate(task) {
    console.log(task.priority);
  return `
    <div draggable="true" ondragstart="startDragging('${task.id}')" class="card"
    onclick="openTaskPopUp('${task.id}')">

        <div  class="${task.category}">
        ${formatCategory(task.category)}
        </div>
        
        <h4>${task.title}</h4>
        
        <p>${task.description}</p>

        <p>Subtasks</p>
        
        <div class="card_footer">
          <div>${getAssingnedContacts(task.assignedTo, false)}</div>
          <img src="../assets/icons/${task.priority}.svg" alt="${task.priority}"> 
        </div>
        
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
  
        <p>${task.description}</p>
  
        <div class="dialog_row">
          <p>Due date:</p>
          <span> ${task.dueDate}</span>
        </div>
  
        <div class="dialog_row">
          <p>Priority:</p>
          <span>
            <div>${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
            <img class= "priority" src="../assets/icons/${task.priority}.svg" alt="${task.priority}">
          </span>
        </div>
  
        <div class="dialog_assigned">
          <p>Assigned To:</p>
           ${getAssingnedContacts(task.assignedTo)}
        </div>  

        <div class="dialog_subtasks">
          <p>Subtasks</p>
          <label>
            <input type="checkbox" checked>
            <div>Implement Recipe Recommendation</div>
          </label>
  
          <label>
            <input type="checkbox">
            <div>Start Page Layout</div>
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