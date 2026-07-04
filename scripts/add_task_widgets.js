/* ── Contacts ── */
/**
 * Lädt alle Kontakte aus Firebase und rendert das Assigned-Dropdown.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadAvailableContacts() {
    
    try {
        const rawContactData = await getFromDB('contacts');
    
        availableContacts = rawContactData
            ? Object.entries(rawContactData).map(([id, contact]) => ({ id, ...contact }))
            : [];
            
        // renderAssignedOptions();

    } catch (error) {
        console.error('Contacts could not be loaded:', error);
        showTaskToast('Contacts could not be loaded.', true);
    }
}


/**
 * Richtet den Outside-Click-Listener zum Schließen des Dropdowns ein.
 *
 * @param {string} [suffix=''] - ID-Zusatz, z.B. 'Edit' für das Edit-Popup.
 * @returns {void}
 */
function setupAssignedDropdown(suffix = '') {
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('assignedDropdown' + suffix);
        if (!dropdown) return;
        if (!dropdown.contains(event.target)) {
            closeAssignedDropdown(suffix);
        }
    });
}

/**
 * Öffnet oder schließt ein Assigned-Dropdown.
 * Wird von Add-Task (ohne Argument) und vom Edit-Popup (suffix = 'Edit') genutzt.
 *
 * @param {string} [suffix=''] - ID-Zusatz, z.B. 'Edit' für das Edit-Popup
 * @returns {void}
 */
function toggleAssignedDropdown(suffix = '') {
    const dropdown = document.getElementById('assignedDropdown' + suffix);
    if (!dropdown) return;

    const list = document.getElementById('assignedOptions' + suffix);
    const arrow = dropdown.querySelector('.assigned_arrow');

    list.classList.toggle('hidden');
    dropdown.classList.toggle('open');
    if (arrow) arrow.classList.toggle('rotated');
}

/**
 * Sets the add-task assigned dropdown open or closed.
 *
 * @param {boolean} isOpen - Whether the dropdown should be opened.
 * @returns {void}
 */
function setAssignedDropdownOpen(isOpen) {
    document.getElementById('assignedOptions').classList.toggle('hidden', !isOpen);
    document.getElementById('assignedArrow').classList.toggle('rotated', isOpen);
    document.querySelector('#assignedDropdown .assigned_trigger').setAttribute('aria-expanded', String(isOpen));
}

/**
 * Opens the add-task assigned dropdown.
 *
 * @returns {void}
 */
function openAssignedDropdown()  { setAssignedDropdownOpen(true);  }

/**
 * Schließt ein Assigned-Dropdown.
 *
 * @param {string} [suffix=''] - ID-Zusatz, z.B. 'Edit' für das Edit-Popup
 * @returns {void}
 */
function closeAssignedDropdown(suffix = '') {
    const dropdown = document.getElementById('assignedDropdown' + suffix);
    if (!dropdown) return;
    document.getElementById('assignedOptions' + suffix)?.classList.add('hidden');
    dropdown.classList.remove('open');
    dropdown.querySelector('.assigned_arrow')?.classList.remove('rotated');
}

/**
 * Fügt einen Kontakt zur Auswahl hinzu oder entfernt ihn daraus.
 *
 * @param {MouseEvent} event - Click event from the selected contact option.
 * @param {string} contactId - Contact id to toggle.
 * @returns {void}
 */
function toggleContactSelection(event, contactId) {
    event.stopPropagation();

    const contact = availableContacts.find(c => c.id === contactId);
    if (!contact) return;

    toggleSelectedContact(contact);
    renderAssignedOptions();
    renderSelectedAvatars();
    refocusAssignedOption(contactId);
}


/**
 * Adds or removes a contact from the selected contacts.
 *
 * @param {Contact} contact - Contact to toggle.
 * @returns {void}
 */
function toggleSelectedContact(contact) {
    const index = selectedContacts.findIndex(c => c.id === contact.id);
    if (index === -1) selectedContacts.push(contact);
    else selectedContacts.splice(index, 1);
}


/**
 * Refocuses the assigned option for the given contact id.
 *
 * @param {string} contactId - Contact id to focus.
 * @returns {void}
 */
function refocusAssignedOption(contactId) {
    const refocusItem = document.querySelector(`#assignedOptions [data-id="${contactId}"]`);
    if (refocusItem) refocusItem.focus();
}

/**
 * Rendert alle Kontakte als auswählbare Listeneinträge im Dropdown.
 *
 * @returns {void}
 */
function renderAssignedOptions() {
    document.getElementById('assignedOptions').innerHTML =
    availableContacts.map(contact => assignedOptionHTML(contact)).join('');
}


/**
 * Renders selected contact avatars below the assigned dropdown.
 *
 * @returns {void}
 */
function renderSelectedAvatars(){
    const html = buildAvatarsHTML(
        selectedContacts.map(c => c.id), 
        availableContacts,
        showAllAvatarsAddTask
    );

    const container = document.getElementById("assignedAvatars");
    container.innerHTML = html;

    const btn = container.querySelector(".js_more_avatars");
    if (btn) {
        btn.addEventListener("click", showAllAssignedAvatarsAddTask);
    }
}


/**
 * Toggles whether all assigned avatars are shown in the add-task form.
 *
 * @returns {void}
 */
function showAllAssignedAvatarsAddTask() {
    showAllAvatarsAddTask = !showAllAvatarsAddTask;
    renderSelectedAvatars();
}



/* ── Category ── */
/**
 * Öffnet oder schließt das Category-Dropdown.
 *
 * @returns {void}
 */
function toggleCategoryDropdown() {
    const options = document.getElementById('categoryOptions');
    const isHidden = options.classList.contains('hidden');
    options.classList.toggle('hidden', !isHidden);
    document.getElementById('categoryArrow').classList.toggle('rotated', isHidden);
    document.querySelector('#categoryDropdown .assigned_trigger').setAttribute('aria-expanded', String(isHidden));
}

/**
 * Selects a task category and updates the custom dropdown UI.
 *
 * @param {string} value - Category value saved in the hidden field.
 * @param {string} label - Category label shown in the dropdown trigger.
 * @param {HTMLElement} el - Selected category option element.
 * @returns {void}
 */
function selectCategory(value, label, el) {
    document.getElementById('taskCategory').value = value;
    document.getElementById('categoryPlaceholder').textContent = label;
    document.querySelectorAll('#categoryOptions .assigned_option').forEach(opt => opt.classList.remove('assigned_option_active'));
    el.classList.add('assigned_option_active');
    document.getElementById('categoryOptions').classList.add('hidden');
    document.getElementById('categoryArrow').classList.remove('rotated');
    document.getElementById('taskCategoryError')?.classList.remove('visible');
    document.querySelector('#categoryDropdown .assigned_trigger')?.classList.remove('input_invalid');
}


/* ── Subtasks ── */
/**
 * Richtet das Subtask-Input ein:
 * Icon-Klick und Enter-Taste fügen einen neuen Subtask hinzu.
 *
 * @returns {void}
 */
function setupSubtaskInput() {
    const subtaskInputElement = document.getElementById('subtaskInput');

    document.getElementById('clearSubtaskBtn')
        .addEventListener('click', () => clearSubtaskInput(subtaskInputElement));
    document.getElementById('confirmSubtaskBtn').addEventListener('click', addSubtask);
    subtaskInputElement.addEventListener('keydown', handleSubtaskKeydown);
}


/**
 * Clears and focuses the subtask input.
 *
 * @param {HTMLInputElement} input - Subtask input element.
 * @returns {void}
 */
function clearSubtaskInput(input) {
    input.value = '';
    input.focus();
}


/**
 * Handles keyboard shortcuts in the subtask input.
 *
 * @param {KeyboardEvent} event - Keydown event from the subtask input.
 * @returns {void}
 */
function handleSubtaskKeydown(event) {
    if (event.key === 'Enter') handleSubtaskEnter(event);
    if (event.key === 'Escape') handleSubtaskEscape(event.target);
}


/**
 * Prevents default submit behavior and adds a subtask.
 *
 * @param {KeyboardEvent} event - Enter keydown event.
 * @returns {void}
 */
function handleSubtaskEnter(event) {
    event.preventDefault();
    addSubtask();
}


/**
 * Clears and blurs the subtask input.
 *
 * @param {HTMLInputElement} input - Subtask input element.
 * @returns {void}
 */
function handleSubtaskEscape(input) {
    input.value = '';
    input.blur();
}

/**
 * Liest den Subtask-Input aus, fügt den Subtask zum State hinzu und rendert die Liste.
 *
 * @returns {void}
 */
function addSubtask() {
    const subtaskInputElement = document.getElementById('subtaskInput');
    const subtaskTitle = subtaskInputElement.value.trim();
    if (!subtaskTitle) return;

    taskSubtasks.push({ title: subtaskTitle, completed: false });
    subtaskInputElement.value = '';
    renderSubtaskList();
}

/**
 * Entfernt einen Subtask anhand seines Index aus dem State und rendert die Liste neu.
 *
 * @param {number} subtaskIndex
 * @returns {void}
 */
function removeSubtask(subtaskIndex) {
    taskSubtasks.splice(subtaskIndex, 1);
    renderSubtaskList();
}


/**
 * Aktiviert den Bearbeitungsmodus
 * eines Subtasks.
 *
 * @param {number} index - Index des Subtasks.
 * @returns {void}
 */
function editSubtaskItem(index) {
    taskSubtasks[index].isEditing = true;
    renderSubtaskList();
    document.getElementById(`subtaskEdit${index}`)?.focus();
}

/**
 * Saves an edited subtask title and leaves edit mode.
 *
 * @param {number} index - Index of the edited subtask.
 * @returns {void}
 */
function saveSubtaskItem(index) {
    const input = document.getElementById(`subtaskEdit${index}`);
    const val = input?.value.trim();
    if (val) taskSubtasks[index].title = val;
    taskSubtasks[index].isEditing = false;
    renderSubtaskList();
}

/**
 * Cancels editing a subtask and restores the rendered list.
 *
 * @param {number} index - Index of the subtask.
 * @returns {void}
 */
function cancelSubtaskEdit(index) {
    taskSubtasks[index].isEditing = false;
    renderSubtaskList();
}

/**
 * Rendert alle Subtasks als Listeneinträge mit Löschen-Button.
 *
 * @returns {void}
 */
function renderSubtaskList() {
    document.getElementById('subtaskList').innerHTML =
        taskSubtasks.map((subtask, i) => subtaskItemHTML(subtask, i)).join('');
}
