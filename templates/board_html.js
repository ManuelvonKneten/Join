function getTaskTemplate(task) {
  return `
    <div 
      class="card"
      data-id="${task.id}"
      role="button"
      draggable="true"
      tabindex="0"
      onkeydown="handleTaskKey(event, '${task.id}')"
      ondragstart="startDragEffect(event); startDragging('${task.id}')"
      ondragend="endDragEffect(event)"
      onclick="openTaskPopUp('${task.id}')"
      >
      
        <div class="${task.category} card_header">
        ${formatCategory(task.category)}
        </div>

        <h2 data-full="false" onclick="toggleFullTitle(this, '${task.title.replace(/'/g, "\\'")}')">
        ${shortenText(task.title, 30)}</h2>
      
        <p>${task.description}</p>

        <div>${getProgressTemplate(task.subtasks || [])}</div>
        
        <div class="card_footer">
          <div class="assigned_contacts"> ${buildAvatarsHTML(task.assignedTo, availableContacts, false)}</div>
          <img src="../assets/icons/${task.priority}.svg" alt="${task.priority}"> 
        </div> 
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
          <span> ${task.dueDate ? task.dueDate.split('-').reverse().join('/') : ''}</span>
        </div>
  
        <div class="dialog_row">
          <p>Priority:</p>
          <span>
            <div>${(task.priority || "low").charAt(0).toUpperCase() + (task.priority || "low").slice(1)}</div>
            <img class= "priority" src="../assets/icons/${task.priority}.svg" alt="${task.priority}">
          </span>
        </div>
  
        <div class="dialog_assigned">
          <p>Assigned to:</p>
           ${buildAvatarsHTML(task.assignedTo, availableContacts, showAllTaskPopupAvatars, true)}
        </div>  

        <div class="dialog_subtasks">
          <p>Subtasks</p>
          <div class="dialog_subtasks_list">
            ${renderSubtasks(task.subtasks, task.id)}
          </div>
         
        </div>
  
        <div class="dialog_footer">
          <button onclick="openDeletePopup('${task.id}')">
          <img  class="delete_icon" src="../assets/icons/delete.svg" alt="delete icon">Delete
          </button>
  
          <button onclick="openEditTaskPopup('${task.id}')">
             <img class="edit_icon" src="../assets/icons/edit.svg" alt="edit icon">Edit
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
        <div class="inputField">
          <input type="text" id="editDueDate" placeholder="dd/mm/yyyy" maxlength="10" inputmode="numeric">
          <input id="editDueDatePicker" type="date" class="due_date_picker_hidden" tabindex="-1">
          <button type="button" class="due_date_trigger" onclick="openEditDueDatePicker()" aria-label="Kalender öffnen">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect x="1" y="3" width="16" height="14" rx="2" stroke="#2a3647" stroke-width="1.5"/>
              <path d="M1 7h16" stroke="#2a3647" stroke-width="1.5"/>
              <path d="M5 1v4M13 1v4" stroke="#2a3647" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="13.5" cy="13.5" r="2" fill="#2a3647"/>
            </svg>
          </button>
        </div>
        <span class="field_error" id="editDueDateError">Please select today or a future date</span>
      </label>

      <label>
       <div class="add_task_field priority_edit">
              <label class="add_task_label" id="prioLabel">Priority</label>
              <div class="add_task_prio_btns " role="group" aria-labelledby="prioLabel">
                <button class="add_task_prio_btn" type="button" data-priority="urgent" aria-pressed="false">
                  Urgent
                  <svg class="prio_icon" aria-hidden="true" width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.9043 14.5096C18.6696 14.51 18.4411 14.4351 18.2522 14.2961L10.0001 8.21288L1.74809 14.2961C1.63224 14.3816 1.50066 14.4435 1.36086 14.4783C1.22106 14.513 1.07577 14.5199 0.933305 14.4986C0.790837 14.4772 0.653973 14.428 0.530528 14.3538C0.407083 14.2796 0.299474 14.1818 0.213845 14.0661C0.128216 13.9503 0.0662437 13.8188 0.0314671 13.6791C-0.00330956 13.5394 -0.0102098 13.3943 0.0111604 13.2519C0.0543195 12.9644 0.21001 12.7058 0.443982 12.533L9.34809 5.96249C9.53679 5.8229 9.76536 5.74756 10.0001 5.74756C10.2349 5.74756 10.4635 5.8229 10.6522 5.96249L19.5563 12.533C19.7422 12.6699 19.8801 12.862 19.9503 13.0819C20.0204 13.3018 20.0193 13.5382 19.9469 13.7573C19.8746 13.9765 19.7349 14.1673 19.5476 14.3024C19.3604 14.4375 19.1352 14.51 18.9043 14.5096Z" fill="#FF3D00"/>
                    <path d="M18.9043 8.76057C18.6696 8.76097 18.4411 8.68612 18.2522 8.54702L10.0002 2.46386L1.7481 8.54702C1.51412 8.71983 1.22104 8.79269 0.93331 8.74956C0.645583 8.70643 0.386785 8.55086 0.213849 8.31706C0.0409137 8.08326 -0.0319941 7.79039 0.011165 7.50288C0.054324 7.21536 0.210015 6.95676 0.443986 6.78395L9.3481 0.213471C9.5368 0.0738799 9.76537 -0.00146484 10.0002 -0.00146484C10.2349 -0.00146484 10.4635 0.0738799 10.6522 0.213471L19.5563 6.78395C19.7422 6.92087 19.8801 7.11298 19.9503 7.33286C20.0204 7.55274 20.0193 7.78914 19.947 8.00832C19.8746 8.22751 19.7349 8.41826 19.5476 8.55335C19.3604 8.68844 19.1352 8.76096 18.9043 8.76057Z" fill="#FF3D00"/>
                  </svg>
                </button>
                <button class="add_task_prio_btn" type="button" data-priority="medium" aria-pressed="false">
                  Medium
                  <svg class="prio_icon" aria-hidden="true" width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.9041 7.45086H1.09589C0.805242 7.45086 0.526498 7.33456 0.320979 7.12755C0.11546 6.92054 0 6.63977 0 6.34701C0 6.05425 0.11546 5.77349 0.320979 5.56647C0.526498 5.35946 0.805242 5.24316 1.09589 5.24316H18.9041C19.1948 5.24316 19.4735 5.35946 19.679 5.56647C19.8845 5.77349 20 6.05425 20 6.34701C20 6.63977 19.8845 6.92054 19.679 7.12755C19.4735 7.33456 19.1948 7.45086 18.9041 7.45086Z" fill="#FFA800"/>
                    <path d="M18.9041 2.2077H1.09589C0.805242 2.2077 0.526498 2.0914 0.320979 1.88439C0.11546 1.67738 0 1.39661 0 1.10385C0 0.81109 0.11546 0.530322 0.320979 0.32331C0.526498 0.116298 0.805242 0 1.09589 0L18.9041 0C19.1948 0 19.4735 0.116298 19.679 0.32331C19.8845 0.530322 20 0.81109 20 1.10385C20 1.39661 19.8845 1.67738 19.679 1.88439C19.4735 2.0914 19.1948 2.2077 18.9041 2.2077Z" fill="#FFA800"/>
                  </svg>
                </button>
                <button class="add_task_prio_btn" type="button" data-priority="low" aria-pressed="false">
                  Low
                  <svg class="prio_icon" aria-hidden="true" width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 8.76077C9.7654 8.76118 9.53687 8.68634 9.34802 8.54726L0.444913 1.97752C0.329075 1.89197 0.231235 1.78445 0.15698 1.66111C0.0827245 1.53777 0.033508 1.40102 0.0121402 1.25868C-0.031014 0.971193 0.0418855 0.678356 0.214802 0.444584C0.387718 0.210811 0.646486 0.0552534 0.934181 0.0121312C1.22188 -0.0309911 1.51493 0.0418545 1.74888 0.214643L10 6.29712L18.2511 0.214643C18.367 0.129087 18.4985 0.0671675 18.6383 0.0324205C18.7781 -0.00232646 18.9234 -0.00922079 19.0658 0.0121312C19.2083 0.0334832 19.3451 0.0826633 19.4685 0.156864C19.592 0.231064 19.6996 0.328831 19.7852 0.444584C19.8708 0.560336 19.9328 0.691806 19.9676 0.831488C20.0023 0.97117 20.0092 1.11633 19.9879 1.25868C19.9665 1.40102 19.9173 1.53777 19.843 1.66111C19.7688 1.78445 19.6709 1.89197 19.5551 1.97752L10.652 8.54726C10.4631 8.68634 10.2346 8.76118 10 8.76077Z" fill="#7AE229"/>
                    <path d="M10 14.5093C9.7654 14.5097 9.53687 14.4349 9.34802 14.2958L0.444913 7.72606C0.210967 7.55327 0.0552944 7.29469 0.0121402 7.00721C-0.031014 6.71973 0.0418855 6.42689 0.214802 6.19312C0.387718 5.95935 0.646486 5.80379 0.934181 5.76067C1.22188 5.71754 1.51493 5.79039 1.74888 5.96318L10 12.0457L18.2511 5.96318C18.4851 5.79039 18.7781 5.71754 19.0658 5.76067C19.3535 5.80379 19.6123 5.95935 19.7852 6.19312C19.9581 6.42689 20.031 6.71973 19.9879 7.00721C19.9447 7.29469 19.789 7.55327 19.5551 7.72606L10.652 14.2958C10.4631 14.4349 10.2346 14.5097 10 14.5093Z" fill="#7AE229"/>
                  </svg>
                </button>
              </div>
            </div>
     </label>

    <div class="edit_assigned_field">
    <p>Assigned to:</p>

    <div class="add_task_field">

    <div class="assigned_dropdown" id="assignedDropdownEdit">
      <div class="assigned_trigger"
           role="combobox"
           aria-expanded="false"
           aria-haspopup="listbox"
           aria-controls="assignedOptions"
           aria-label="Kontakte zuweisen"
           tabindex="0"
           onclick="toggleAssignedDropdown('Edit')"
           onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleAssignedDropdown('Edit');}">
        <span class="assigned_placeholder">
          Select contacts to assign
        </span>

        <svg class="assigned_arrow" id="assignedArrow" width="12" height="8">
          <path d="M1 1L6 7L11 1" stroke="#2A3647" stroke-width="2"/>
        </svg>

      </div>

      <ul class="assigned_options hidden"
          id="assignedOptionsEdit"
          role="listbox"></ul>
    </div>

    <div class="assigned_avatars" id="assignedAvatarsEdit"></div>

  </div>
</div>

  
      <p class="subtasks_edit_title">Subtasks</p>   
      <div class="subtask_add">
        <input id="newSubtask" type="text" placeholder="Add new subtask" onkeydown="handleEditSubtaskEnter(event)">
        <button id="editAddSubtaskIcon" onclick="addEditSubtask()">✓</button>
      </div>
        <div id="editSubtasks" class="edit_subtasks_container"></div>
        
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
                    <img src="../assets/icons/delete.png"></button>

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
                    <img src="../assets/icons/edit.png" alt="">
                </button>

                <button onclick="deleteSubtask(${index})"><img src="../assets/icons/delete.png"></button>
            </div>
        </div>
    `;
}


function getAssignedOptionsEdit(contact, checked) {
  return `
            <li class="assigned_option ${checked ? 'assigned_option_active' : ''}"
                onclick="toggleEditContact('${contact.id}')">

                <div class="assigned_option_avatar">
                    ${getContactsAvatar(contact.name, false)}
                </div>

                <span class="assigned_option_name">
                    ${contact.name}
                </span>

                <input 
                    type="checkbox" 
                    class="assigned_option_checkbox"
                    ${checked ? "checked" : ""}
                >
            </li>
        `;
}

function progressHTML(progress) {
    return `
        <div class="task_progress"
             title="${progress.completed} of ${progress.total} subtasks completed">

            <progress
                value="${progress.completed}"
                max="${progress.total}">
            </progress>

            <span>
                ${progress.completed}/${progress.total} Subtasks
            </span>
        </div>
    `;
}