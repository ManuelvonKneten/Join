
function getTaskTemplate(task) {
  return `
    <div draggable="true" ondragstart="startDragging('${task.id}')" class="card"
    onclick="openTaskPopUp('${task.id}')">

        <div class="${task.category} card_header">
        ${formatCategory(task.category)}
        </div>
        
        <h4>${task.title}</h4>
        
        <p>${task.description}</p>

        <span>Subtasks</span>
        
        <div class="card_footer">
          <div  class="assigned_contacts">${renderAssingnedContacts(task.assignedTo, false)}</div>
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
           ${renderAssingnedContacts(task.assignedTo)}
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
          <button>
             <img src="../assets/icons/delete.png" alt="delete icon">Delete
          </button>
  
          <button>
             <img class="edit_icon" src="../assets/icons/edit.png" alt="edit icon">Edit
          </button>
        </div>
    </div>
  
  `;
}


function getContactsAvatar(name, showName) {
  return `
     <div class="contact_task">
                <div class="contact_avatar"
                    style="background-color:${avatarColor(name)}">
                    ${initials(name)}
                </div>
                ${showName ? `<span>${name}</span>` : ''} 
            </div>
  `;
}

function getNewHTMLTag() {
  return `
        <div class="popup_header">
            <h1 class="add_task_heading">Add Task</h1>
            <button onclick="closeAddTaskPopUp()">
            <img src="../assets/icons/close_icon.svg" alt="close icon">
            </button>
        </div>
  `;
}