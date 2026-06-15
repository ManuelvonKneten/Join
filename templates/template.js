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
 * Gibt das HTML eines Initialen-Avatars für einen ausgewählten Kontakt zurück.
 *
 * @function selectedAvatarHTML
 * @param {{ name: string }} contact - Kontaktobjekt
 * @returns {string} HTML-String des Avatars
 */
function selectedAvatarHTML(contact) {
    return `
        <div class="assigned_selected_avatar" style="background-color: ${avatarColor(contact.name)}">
            ${initials(contact.name)}
        </div>
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
    return `
        <li class="add_task_subtask_item">
            <span>${subtask.title}</span>
            <button type="button" class="add_task_subtask_remove" onclick="removeSubtask(${index})">&#x2715;</button>
        </li>
    `;
}
