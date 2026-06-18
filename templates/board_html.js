function getTaskTemplate(task) {
  return `
    <div  class="taskContainer">
      <div draggable="true"
      ondragstart="startDragEffect(event); startDragging('${task.id}')"
      ondragend="endDragEffect(event)"
      onclick="openTaskPopUp('${task.id}')"
      class="card">

        <div class="${task.category} card_header">
        ${formatCategory(task.category)}
        </div>
        
        <h2>${task.title}</h2>
        
        <p>${task.description}</p>

        <div>${getProgressTemplate(task.subtasks || [])}</div>
        
        <div class="card_footer">
          <div class="assigned_contacts">${renderAssignedContacts(task.assignedTo, false)}</div>
          <img src="../assets/icons/${task.priority}.svg" alt="${task.priority}"> 
        </div> 
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
              x
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
          <p>Assigned to:</p>
           ${renderAssignedContacts(task.assignedTo)}
        </div>  

        <div class="dialog_subtasks">
          <p>Subtasks</p>
          ${renderSubtasks(task.subtasks, task.id)}
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


function getSubtasksTemplate(subtask, index, taskId) {
  return `
      <label class="subtask_checkbox">
        <input 
          type="checkbox" 
          ${subtask.completed ? "checked" : ""} 
          onchange="toggleSubtask('${taskId}', ${index})"
        >
        <div>${subtask.title}</div>
      </label>
    `;
}


function getEditTaskTemplate(task) {
  return `
    <div class="dialog_content edit_content">

      <div class="dialog_header">
        <h2>Edit Task</h2>
        <button onclick="closeTaskPopUp()">
          x
        </button>
      </div>

      <label>
        <p>Title</p>
        <input class="label_input" id="editTitle" value="${task.title}">
      </label>

      <label>
        <p>Description</p>
        <textarea class="description" id="editDescription">${task.description}</textarea>
      </label>

      <label>
       <p>Due Date</p> 
        <input class="label_input" type="date" id="editDueDate" value="${task.dueDate}">
      </label>

      <label>
        <p>Priority</p>
        <div class="edit_priority">
          <select class="label_input" id="editPriority">
            <option value="low" ${task.priority === "low" ? "selected" : ""}>Low</option>
            <option value="medium" ${task.priority === "medium" ? "selected" : ""}>Medium</option>
            <option value="urgent" ${task.priority === "urgent" ? "selected" : ""}>Urgent</option>
          </select>
       
          <img id="editPriorityIcon" src="../assets/icons/${task.priority}.svg"  alt="${task.priority}">
        </div>
     </label>

      
      <label>Subtasks</label>   
      <div class="subtask_add">
        <input id="newSubtask" type="text" placeholder="Add new subtask" onkeydown="handleSubtaskEnter(event)">
        <button id="editAddSubtaskIcon" onclick="addEditSubtask()">✓</button>
      </div>
        <div id="editSubtasks"></div>
        
      <div class="dialog_footer">
        <button onclick="saveTaskEdit('${task.id}')">
        ✓ Save
        </button>
      </div>

    </div>
  `;
}


function getSubtasksEditTemplate(subtask, index) {

    if (subtask.isEditing) {
        return `
            <div class="edit_subtask">
                <input
                    id="subtaskInput${index}"
                    type="text"
                    value="${subtask.title}"
                >

                <div class="delete_edit_icon">
                    <button onclick="deleteSubtask(${index})">
                    <img src="/assets/icons/delete.png"></button>

                    <button onclick="saveSubtask(${index})">✔️</button>
                </div>
            </div>
        `;
    }

    return `
        <div class="edit_subtask">
            <span>• ${subtask.title}</span>

            <div class="delete_edit_icon">
                <button onclick="editSubtask(${index})">
                    <img src="/assets/icons/edit.png" alt="">
                </button>

                <button onclick="deleteSubtask(${index})"><img src="/assets/icons/delete.png"></button>
            </div>
        </div>
    `;
}