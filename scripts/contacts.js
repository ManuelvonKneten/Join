/* ── State ── */
let allContacts = [];
let activeContact = null;


/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    initContactValidation();

}); 
    


document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    const addOverlay = document.getElementById('addContactOverlay');
    const editOverlay = document.getElementById('editContactOverlay');

    if (addOverlay && !addOverlay.classList.contains('hidden')) {
        closeAddContact();
        return;
    }

    if (editOverlay && !editOverlay.classList.contains('hidden')) {
        closeEditContact();
        return;
    }
});


/* ── CRUD ── */
/**
 * Loads all contacts from the database into local state and renders the list.
 *
 * @async
 * @returns {Promise<void>}
 */
async function loadContacts() {
    try {
        const rawContactsData = await getFromDB('contacts');
        allContacts = rawContactsData
            ? Object.entries(rawContactsData).map(([id, contactData]) => ({ id, ...contactData }))
            : [];
        renderContacts();
    } catch {
        showContactToast('Could not load contacts.', true);
    }
}


/**
 * Creates a new contact after validating the form data.
 *
 * Prevents the default form submission, validates name, email, and phone input,
 * saves the contact to the database, updates the contact list, and shows a success
 * or error message.
 *
 * @async
 * @param {Event} event - The submit event from the add contact form.
 * @returns {Promise<void>} Resolves when the contact creation process is completed.
 */
async function createContact(event) {
    event.preventDefault();
    const formData = getValidContactData('contact');
    if (!formData) return;
    await persistNewContact(formData, event.target);
}


/**
 * Validates a contact form and toggles its error messages.
 *
 * Reads the name, email and phone fields for the given id prefix
 * ('contact' for add, 'editContact' for edit) and validates each one.
 *
 * @param {string} prefix - The field id prefix.
 * @returns {{name: string, email: string, phone: string}|null} Trimmed values, or null if invalid.
 */
function getValidContactData(prefix) {
    const fields = [
        ['Name', isValidContactName],
        ['Email', isValidContactEmail],
        ['Phone', isValidContactPhone],
    ];
    const result = {};
    for (const [field, isValid] of fields) {
        const el = document.getElementById(prefix + field);
        const ok = isValid(el.value);
        setErrorVisible(document.getElementById(`${prefix}${field}Error`), !ok);
        if (!ok) return null;
        result[field.toLowerCase()] = el.value.trim();
    }
    return result;
}


/**
 * Saves a new contact to the database and updates state and UI.
 *
 * @async
 * @param {{name: string, email: string, phone: string}} formData - The validated contact data.
 * @param {HTMLFormElement} form - The add contact form element.
 * @returns {Promise<void>}
 */
async function persistNewContact(formData, form) {
    setCreateButtonLoading(form, true);
    try {
        const response = await postToDB('contacts', formData);
        allContacts.push({ id: response.name, ...formData });
        renderContacts();
        closeAddContact();
        showContactToast('Contact successfully created');
    } catch {
        showContactToast('Something went wrong. Please try again.', true);
    } finally {
        setCreateButtonLoading(form, false);
    }
}


/**
 * Hides all contact form error messages.
 *
 * @returns {void}
 */
function hideAllContactErrors(){
    const errors = [
        'contactNameError',
        'contactEmailError',
        'contactPhoneError'
    ];
    
    errors.forEach(id => {
        setErrorVisible(document.getElementById(id), false)
    })
}


/**
 * Hides all edit contact form error messages.
 *
 * @returns {void}
 */
function hideAllEditContactErrors(){
    const errors = [
        'editContactNameError',
        'editContactEmailError',
        'editContactPhoneError'
    ];

    errors.forEach(id => {
        setErrorVisible(document.getElementById(id), false)
    })
}

/**
 * Checks whether a contact name contains only letters and spaces.
 *
 * @param {string} value - The contact name to validate.
 * @returns {boolean} True if the name contains only valid characters.
 */
function isValidContactName(value) {
    return /^[a-zA-ZÄäÖöÜüß\s]+$/.test(value.trim()) && value.trim().length >= 1;
}


/**
 * Checks whether an email address has a valid format.
 *
 * @param {string} value - The email address to validate.
 * @returns {boolean} True if the email address matches the required format.
 */
function isValidContactEmail(value) {
    const emailRegex = /^[^\s@.][^\s@]*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
    return emailRegex.test(value.trim());    
}


/**
 * Checks whether a phone number contains only valid phone characters.
 *
 * Allows an optional leading plus sign, numbers, and spaces.
 *
 * @param {string} value - The phone number to validate.
 * @returns {boolean} True if the phone number contains valid characters.
 */
function isValidContactPhone(value) {
    return /^\+?[0-9\s]+$/.test(value.trim());
}


/**
 * Updates the create button while the contact is being saved.
 *
 * @param {HTMLFormElement} form - The add contact form element.
 * @param {boolean} isLoading - Whether the save request is currently running.
 * @returns {void}
 */
function setCreateButtonLoading(form, isLoading) {
    const btn = form.querySelector('.btn_modal_create');
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Saving…' : 'Create contact ✓';
}


/**
 * Initializes validation event listeners for the contact form fields.
 *
 * Adds blur event listeners to the name, email, and phone input fields.
 * When a field loses focus, its value is validated and the corresponding
 * error message visibility is updated.
 *
 * @function initContactValidation
 * @returns {void}
 */
function initContactValidation() {
    wireContactFieldValidation('contact');
    wireContactFieldValidation('editContact');
}


/**
 * Wires blur validation onto a contact form's name, email and phone fields.
 *
 * Missing fields are skipped, so the same call works on pages that only
 * contain one of the forms (or none, like board.html).
 *
 * @param {string} prefix - The field id prefix ('contact' or 'editContact').
 * @returns {void}
 */
function wireContactFieldValidation(prefix) {
    const validators = {
        Name: isValidContactName,
        Email: isValidContactEmail,
        Phone: isValidContactPhone,
    };
    for (const [field, isValid] of Object.entries(validators)) {
        const input = document.getElementById(prefix + field);
        if (!input) continue;
        input.addEventListener('blur', () =>
            setErrorVisible(document.getElementById(`${prefix}${field}Error`), !isValid(input.value))
        );
    }
}


/**
 * Saves changed contact data in the database and updates state and UI.
 *
 * @async
 * @param {Event} event - The submit event from the edit contact form.
 * @returns {Promise<void>}
 */
async function saveContact(event) {
    event.preventDefault();
    if (!activeContact) return;
    const updated = getValidContactData('editContact');
    if (!updated) return;
    await persistContactUpdate(updated);
}


/**
 * Persists changed contact data to the database and updates state and UI.
 *
 * @async
 * @param {{name: string, email: string, phone: string}} updated - The validated contact data.
 * @returns {Promise<void>}
 */
async function persistContactUpdate(updated) {
    try {
        await patchToDB(`contacts/${activeContact.id}`, updated);
        Object.assign(activeContact, updated);
        const idx = allContacts.findIndex(c => c.id === activeContact.id);
        if (idx !== -1) allContacts[idx] = { ...activeContact };
        renderContacts();
        showContactDetail(activeContact);
        closeEditContact();
        showContactToast('Contact updated');
    } catch {
        showContactToast('Could not save contact.', true);
    }
}


/**
 * Deletes the active contact from the database, state, and UI.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteContact() {
    if (!activeContact) return;

    try {
        await deleteFromDB(`contacts/${activeContact.id}`);
        allContacts = allContacts.filter(c => c.id !== activeContact.id);
        activeContact = null;
        renderContacts();
        document.querySelector('.contacts_right_bottom').classList.add('hidden');
        document.querySelector('.contacts_layout').classList.remove('detail_open');
        document.body.classList.remove('contact_detail_open');
        closeEditContact();
        showContactToast('Contact deleted');
    } catch {
        showContactToast('Could not delete contact.', true);
    }
}


/* ── Render ── */
/**
 * Renders all contacts grouped alphabetically in the contact list.
 * Shows a message when no contacts exist.
 *
 * @returns {void}
 */
function renderContacts() {
    const list = document.getElementById('contactList');
    if (!list) return;
    if (!allContacts.length) return list.innerHTML = '<p class="no_contacts">No contacts yet.</p>';
      
    const sorted = [...allContacts].sort((a, b) => a.name.localeCompare(b.name));
    const groups = sorted.reduce((acc, contact) => {
        const letter = contact.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(contact);
        return acc;
    }, {});
    list.innerHTML = Object.keys(groups).sort().map(letter => contactGroupHTML(letter, groups[letter]))2.join('');
}


/* ── Detail ── */
/**
 * Shows the contact detail view in the right panel.
 *
 * @param {{ id: string, name: string, email: string, phone: string }} contact - The contact to show.
 * @returns {void}
 */
function showContactDetail(contact) {
    activeContact = contact;
    highlightActiveContactItem(contact.id);
    renderContactDetailFields(contact);

    document.querySelector('.contacts_right_bottom').classList.remove('hidden');
    document.querySelector('.contacts_layout').classList.add('detail_open');
    document.body.classList.add('contact_detail_open');
}


/**
 * Highlights the contact list item matching the given id.
 *
 * @param {string} id - The id of the contact to highlight.
 * @returns {void}
 */
function highlightActiveContactItem(id) {
    document.querySelectorAll('.contact_item').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.contact_item[data-id="${id}"]`);
    if (activeEl) activeEl.classList.add('active');
}


/**
 * Fills the detail panel avatar, name, email and phone for a contact.
 *
 * @param {{ name: string, email: string, phone: string }} contact - The contact to render.
 * @returns {void}
 */
function renderContactDetailFields(contact) {
    const avatar = document.querySelector('.crb_avatar');
    avatar.textContent = initials(contact.name);
    avatar.style.backgroundColor = avatarColor(contact.name);
    document.querySelector('.crb_name').textContent = contact.name;

    const emailLink = document.getElementById('detailEmail');
    emailLink.textContent = contact.email || '—';
    emailLink.href = contact.email ? `mailto:${contact.email}` : '#';
    document.getElementById('detailPhone').textContent = contact.phone || '—';
}


/**
 * Closes the contact detail view and clears the active contact.
 *
 * @returns {void}
 */
function closeContactDetail() {
    document.querySelector('.contacts_layout').classList.remove('detail_open');
    document.querySelector('.contacts_right_bottom').classList.add('hidden');
    document.querySelectorAll('.contact_item').forEach(item => item.classList.remove('active'));
    document.body.classList.remove('contact_detail_open');
    activeContact = null;
}


/* ── Modals ── */
/**
 * Opens the add contact modal.
 *
 * @returns {void}
 */
function openAddContact() {
    document.getElementById('addContactOverlay').classList.remove('hidden');
    document.body.classList.add('no-scroll');
}


/**
 * Closes the add contact modal and resets all fields.
 *
 * @returns {void}
 */
function closeAddContact() {
    document.getElementById('addContactOverlay').classList.add('hidden');
    document.body.classList.remove('no-scroll');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
}


/**
 * Closes the add contact modal when the overlay background is clicked.
 *
 * @param {MouseEvent} event - The click event on the overlay.
 * @returns {void}
 */
function overlayClose(event) {
    if (event.target === document.getElementById('addContactOverlay')) {
        closeAddContact();
    }
}


/**
 * Opens the edit contact modal and fills it with the selected contact data.
 *
 * @param {{ name: string, email: string, phone: string }} contact - The contact to edit.
 * @returns {void}
 */
function openEditContact(contact) {
    hideAllEditContactErrors();
    document.getElementById('editContactName').value = contact.name || '';
    document.getElementById('editContactEmail').value = contact.email || '';
    document.getElementById('editContactPhone').value = contact.phone || '';

    const avatar = document.getElementById('editContactAvatar');
    avatar.textContent = contact.name ? initials(contact.name) : '';
    avatar.style.backgroundColor = contact.name ? avatarColor(contact.name) : '';

    document.getElementById('editContactOverlay').classList.remove('hidden');
    document.body.classList.add('no-scroll');
}


/**
 * Closes the edit contact modal.
 *
 * @returns {void}
 */
function closeEditContact() {
    document.getElementById('editContactOverlay').classList.add('hidden');
    document.body.classList.remove('no-scroll');
}


/**
 * Closes the edit contact modal when the overlay background is clicked.
 *
 * @param {MouseEvent} event - The click event on the overlay.
 * @returns {void}
 */
function overlayEditClose(event) {
    if (event.target === document.getElementById('editContactOverlay')) {
        closeEditContact();
    }
}


/* ── Toast ── */
/**
 * Shows a toast message for a short time.
 *
 * @param {string} message - The message to display.
 * @param {boolean} [isError=false] - Whether the toast should use the error style.
 * @returns {void}
 */
function showContactToast(message, isError = false) {
    const toast = document.getElementById('contactToast');
    toast.textContent = message;
    toast.classList.toggle('toast_error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
