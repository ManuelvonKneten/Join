/**
 * Gibt das HTML einer alphabetischen Kontaktgruppe (inkl. ihrer Einträge) zurück.
 *
 * @function contactGroupHTML
 * @param {string} letter - Anfangsbuchstabe der Gruppe
 * @param {Array<{ id: string, name: string, email: string, phone: string }>} contacts - Kontakte der Gruppe
 * @returns {string} HTML-String der Kontaktgruppe
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
 * Gibt das HTML eines einzelnen Kontakteintrags als String zurück.
 *
 * @function contactItemHTML
 * @param {{ id: string, name: string, email: string, phone: string }} contact - Kontaktobjekt
 * @returns {string} HTML-String des Kontakteintrags
 */
function contactItemHTML(contact) {
    return `
        <div class="contact_item" data-id="${contact.id}" onclick="showContactDetail(${JSON.stringify(contact).replace(/"/g, '&quot;')})">
            <div class="contact_avatar" style="background-color:${avatarColor(contact.name)}">
                ${initials(contact.name)}
            </div>
            <div class="contact_info">
                <span class="contact_name">${contact.name}</span>
                <span class="contact_email">${contact.email}</span>
            </div>
        </div>
    `;
}


/**
 * Gibt das HTML eines Kontakt-Eintrags im Assigned-Dropdown zurück.
 *
 * @function assignedOptionHTML
 * @param {{ id: string, name: string }} contact - Kontaktobjekt
 * @returns {string} HTML-String des Dropdown-Eintrags
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
                ${initials(contact.name)}
            </div>
            <span class="assigned_option_name">${contact.name}</span>
            <input type="checkbox" class="assigned_option_checkbox" ${isSelected ? 'checked' : ''} tabindex="-1" aria-hidden="true">
        </li>
    `;
}


/**
 * Gibt das HTML eines Subtask-Listeneintrags mit Löschen-Button zurück.
 *
 * @function subtaskItemHTML
 * @param {{ title: string, done: boolean }} subtask - Subtask-Objekt
 * @param {number} index - Index des Subtasks im State
 * @returns {string} HTML-String des Subtask-Listeneintrags
 */
function subtaskItemHTML(subtask, index) {
    if (subtask.isEditing) {
        return `
            <li class="add_task_subtask_item add_task_subtask_item--editing">
                <input
                    id="subtaskEdit${index}"
                    class="add_task_subtask_input"
                    type="text"
                    value="${subtask.title}"
                    onkeydown="if(event.key==='Enter'){event.preventDefault();saveSubtaskItem(${index});}if(event.key==='Escape'){cancelSubtaskEdit(${index});}"
                >
                <div class="add_task_subtask_actions">
                    <button type="button" class="add_task_subtask_action_btn" onclick="removeSubtask(${index})" aria-label="Delete">
                        <img src="../assets/icons/delete.svg" alt="" aria-hidden="true">
                    </button>
                    <span class="add_task_subtask_divider">|</span>
                    <button type="button" class="add_task_subtask_action_btn" onclick="saveSubtaskItem(${index})" aria-label="Save">&#x2713;</button>
                </div>
            </li>
        `;
    }
    return `
        <li class="add_task_subtask_item">
            <span>&#8226; ${subtask.title}</span>
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
                    ${initials(name)}
                </div>
                ${showName ? `<span>${name}</span>` : ""} 
            </div>
  `;
}

