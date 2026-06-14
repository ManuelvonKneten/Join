function getTaskTemplate(task) {
  return `
    <div  id="taskContainer">
      <div draggable="true"
      ondragstart="startDragEffect(event); startDragging('${task.id}')"
      ondragend="endDragEffect(event)"
      onclick="openTaskPopUp('${task.id}')"
      class="card">

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
            <div></div>
          </label>
  
          <label>
            <input type="checkbox">
            <div></div>
          </label>
        </div>
  
        <div class="dialog_footer">
          <button onclick="openDeletePopup('${task.id}')">
             <img src="../assets/icons/delete.png" alt="delete icon">Delete
          </button>
  
          <button onclick="openEditTaskPopup('${task.id}')">
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
                ${showName ? `<span>${name}</span>` : ""} 
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


function getEditTaskTemplate(task) {
  return `
    <div class="dialog_content">

      <div class="dialog_header">
        <h2>Edit Task</h2>
        <button onclick="closeTaskPopUp()">
          <img src="../assets/icons/close_icon.svg" alt="close icon">
        </button>
      </div>

      <label>
        Title
        <input id="editTitle" value="${task.title}">
      </label>

      <label>
        Description
        <textarea id="editDescription">${task.description}</textarea>
      </label>

      <label>
        Due Date
        <input type="date" id="editDueDate" value="${task.dueDate}">
      </label>


      <label>
        Priority
        <select id="editPriority">
          <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
          <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
          <option value="high" ${task.priority === "high" ? "selected" : ""}>High</option>
        </select>
      </label>

   
      <div class="dialog_footer">
        <button onclick="saveTaskEdit('${task.id}')">
          Save
        </button>
      </div>

    </div>
  `;
}