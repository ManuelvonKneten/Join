/**
 * Returns the HTML of an alphabetical contact group (including its entries).
 *
 * @function contactGroupHTML
 * @param {string} letter - First letter of the group
 * @param {Array<{ id: string, name: string, email: string, phone: string }>} contacts - Contacts of the group
 * @returns {string} HTML string of the contact group
 */
function contactGroupHTML(letter, contacts) {
    return `
        <div class="contact_group">
            <span class="contact_group_letter">${letter}</span>
            <div class="contact_group_divider"></div>
            ${contacts.map(contactItemHTML).join('')}
        </div>
    `;
}


/**
 * Returns the HTML of a single contact entry as a string.
 *
 * @function contactItemHTML
 * @param {{ id: string, name: string, email: string, phone: string }} contact - Contact object
 * @returns {string} HTML string of the contact entry
 */
function contactItemHTML(contact) {
    return `
        <div class="contact_item" data-id="${contact.id}" onclick="showContactDetail(${JSON.stringify(contact).replace(/"/g, '&quot;')})">
            <div class="contact_avatar" style="background-color:${avatarColor(contact.name)}">
                ${escapeHtml(initials(contact.name))}
            </div>
            <div class="contact_info">
                <span class="contact_name">${escapeHtml(contact.name)}${contact.isCurrentUser ? ' (You)' : ''}</span>
                <span class="contact_email">${escapeHtml(contact.email)}</span>
            </div>
        </div>
    `;
}


/**
 * Returns the HTML of a contact entry in the assigned dropdown.
 *
 * @function assignedOptionHTML
 * @param {{ id: string, name: string }} contact - Contact object
 * @returns {string} HTML string of the dropdown entry
 */
function assignedOptionHTML(contact) {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    return `
        <li class="assigned_option ${isSelected ? 'assigned_option_active' : ''}"
            role="option"
            aria-selected="${isSelected}"
            tabindex="0"
            data-id="${contact.id}"
            onclick="toggleContactSelection(event, '${contact.id}')"
            onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleContactSelection(event,'${contact.id}');}">
            <div class="assigned_option_avatar" style="background-color: ${avatarColor(contact.name)}">
                ${escapeHtml(initials(contact.name))}
            </div>
            <span class="assigned_option_name">${escapeHtml(contact.name)}</span>
            <input type="checkbox" class="assigned_option_checkbox" ${isSelected ? 'checked' : ''} tabindex="-1" aria-hidden="true">
        </li>
    `;
}


/**
 * Returns the HTML of a subtask list entry with a delete button.
 *
 * @function subtaskItemHTML
 * @param {{ title: string, done: boolean }} subtask - Subtask object
 * @param {number} index - Index of the subtask in the state
 * @returns {string} HTML string of the subtask list entry
 */
function subtaskItemHTML(subtask, index) {
    if (subtask.isEditing) {
        return `
            <li class="add_task_subtask_item add_task_subtask_item--editing">
                <input
                    id="subtaskEdit${index}"
                    class="add_task_subtask_input"
                    type="text"
                    value="${escapeHtml(subtask.title)}"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();saveSubtaskItem(${index});}if(event.key==='Escape'){cancelSubtaskEdit(${index});}"
                >
                <div class="add_task_subtask_actions">
                    <button type="button" class="add_task_subtask_action_btn" onclick="cancelSubtaskEdit(${index})" aria-label="Cancel">
                        <img src="../assets/icons/close_icon.svg" alt="" aria-hidden="true">
                    </button>
                    <span class="add_task_subtask_divider">|</span>
                    <button type="button" class="add_task_subtask_action_btn" onclick="saveSubtaskItem(${index})" aria-label="Save">&#x2713;</button>
                </div>
            </li>
        `;
    }
    return `
        <li class="add_task_subtask_item">
            <span>&#8226; ${escapeHtml(subtask.title)}</span>
            <div class="add_task_subtask_actions">
                <button type="button" class="add_task_subtask_action_btn" onclick="editSubtaskItem(${index})" aria-label="Edit">
                    <img src="../assets/icons/edit.svg" alt="" aria-hidden="true">
                </button>
                <span class="add_task_subtask_divider">|</span>
                <button type="button" class="add_task_subtask_action_btn" onclick="removeSubtask(${index})" aria-label="Delete">
                    <img src="../assets/icons/delete.svg" alt="" aria-hidden="true">
                </button>
            </div>
        </li>
    `;
}


function getContactsAvatar (name, showName) {
  return `
     <div class="contact_task">
                <div class="contact_avatar assigned_selected_avatar"
                    style="background-color:${avatarColor(name)}">
                    ${escapeHtml(initials(name))}
                </div>
                ${showName ? `<span>${escapeHtml(name)}</span>` : ""}
            </div>
  `;
}
