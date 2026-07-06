/* ── State ── */
let allContacts = [];
let activeContact = null;


/* ── Init ── */
document.addEventListener('DOMContentLoaded', loadContacts);
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    const addOverlay = document.getElementById('addContactOverlay');
    const editOverlay = document.getElementById('editContactOverlay');

    if (addOverlay && !addOverlay.classList.contains('hidden')) {
        closeAddContact();
        return;
    }

    if(editOverlay && !editOverlay.classList.contains('hidden')){
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
 * Creates a new contact, saves it in the database, and updates the UI.
 *
 * @async
 * @param {Event} event - The submit event from the add contact form.
 * @returns {Promise<void>}
 */
async function createContact(event) {
    event.preventDefault();
    const formData = getContactFormData();
    setCreateButtonLoading(event.target, true);

    try {
        await saveNewContact(formData);
        onContactCreated();
    } catch {
        onContactCreateFailed();
    } finally {
        setCreateButtonLoading(event.target, false);
    }
}


/**
 * Saves a new contact and adds it to the local state.
 *
 * @async
 * @param {{ name: string, email: string, phone: string }} formData - The new contact data.
 * @returns {Promise<void>}
 */
async function saveNewContact(formData) {
    const newId = await postContact(formData);
    addContactToState(newId, formData);
}


/**
 * Shows the error message for a failed contact creation.
 *
 * @returns {void}
 */
function onContactCreateFailed() {
    showContactToast('Something went wrong. Please try again.', true);
}


/**
 * Reads the values from the add contact form.
 *
 * @returns {{ name: string, email: string, phone: string }} The contact form data.
 */
function getContactFormData() {
    return {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim()
    };
}


/**
 * Updates the create button while the contact is being saved.
 *
 * @param {HTMLFormElement} form - The add contact form element.
 * @param {boolean} isLoading - Whether the save request is currently running.
 * @returns {void}
 */
function setCreateButtonLoading(form, isLoading) {
    const createButton = form.querySelector('.btn_modal_create');
    createButton.disabled = isLoading;
    createButton.textContent = isLoading ? 'Saving…' : 'Create contact ✓';
}


/**
 * Saves a contact in the database and returns the generated id.
 *
 * @async
 * @param {{ name: string, email: string, phone: string }} contactData - The contact data to save.
 * @returns {Promise<string>} The generated Firebase id.
 * @throws {Error} If the request fails.
 */
async function postContact(contactData) {
    const firebaseResponse = await postToDB('contacts', contactData);
    return firebaseResponse.name; // Firebase ID
}


/**
 * Adds a newly created contact to the local contact state.
 *
 * @param {string} id - The contact id from the database.
 * @param {{ name: string, email: string, phone: string }} contactData - The new contact data.
 * @returns {void}
 */
function addContactToState(id, contactData) {
    allContacts.push({ id, ...contactData });
}


/**
 * Updates the UI after a contact was created successfully.
 *
 * @returns {void}
 */
function onContactCreated() {
    renderContacts();
    closeAddContact();
    showContactToast('Contact successfully created');
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

    const updatedContactData = getEditContactFormData();

    try {
        await patchToDB(`contacts/${activeContact.id}`, updatedContactData);
        updateActiveContactState(updatedContactData);
        onContactSaved();
    } catch {
        showContactToast('Could not save contact.', true);
    }
}


/**
 * Reads the values from the edit contact form.
 *
 * @returns {{ name: string, email: string, phone: string }} The edited contact data.
 */
function getEditContactFormData() {
    return {
        name: document.getElementById('editContactName').value.trim(),
        email: document.getElementById('editContactEmail').value.trim(),
        phone: document.getElementById('editContactPhone').value.trim(),
    };
}


/**
 * Updates the active contact and the matching contact in local state.
 *
 * @param {{ name: string, email: string, phone: string }} updatedContactData - The edited contact data.
 * @returns {void}
 */
function updateActiveContactState(updatedContactData) {
    Object.assign(activeContact, updatedContactData);
    const activeContactIndex = allContacts.findIndex(contact => contact.id === activeContact.id);
    if (activeContactIndex !== -1) allContacts[activeContactIndex] = { ...activeContact };
}


/**
 * Updates the UI after a contact was saved successfully.
 *
 * @returns {void}
 */
function onContactSaved() {
    renderContacts();
    showContactDetail(activeContact);
    closeEditContact();
    showContactToast('Contact updated');
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
        removeContactFromState(activeContact.id);
        renderContacts();
        resetContactDetailViewAfterDelete();
        showContactToast('Contact deleted');
    } catch {
        showContactToast('Could not delete contact.', true);
    }
}


/**
 * Removes a contact from local state and clears the active contact.
 *
 * @param {string} contactId - The id of the contact to remove.
 * @returns {void}
 */
function removeContactFromState(contactId) {
    allContacts = allContacts.filter(contact => contact.id !== contactId);
    activeContact = null;
}


/**
 * Resets the detail view after a contact was deleted.
 *
 * @returns {void}
 */
function resetContactDetailViewAfterDelete() {
    document.querySelector('.contacts_right_bottom').classList.add('hidden');
    document.querySelector('.contacts_layout').classList.remove('detail_open');
    document.body.classList.remove('contact_detail_open');
    closeEditContact();
}


/* ── Render ── */
/**
 * Renders all contacts grouped alphabetically in the contact list.
 * Shows a message when no contacts exist.
 *
 * @returns {void}
 */
function renderContacts() {
    const contactListElement = document.getElementById('contactList');

    if (!contactListElement) return;
    if (!allContacts.length) {
        contactListElement.innerHTML = '<p class="no_contacts">No contacts yet.</p>';
        return;
    }

    const sortedContacts = getSortedContacts();
    const contactGroups = groupContactsByFirstLetter(sortedContacts);
    renderContactGroups(contactGroups, contactListElement);
}


/**
 * Returns contacts sorted alphabetically by name.
 *
 * @returns {Array<{ id: string, name: string, email: string, phone: string }>} The sorted contacts.
 */
function getSortedContacts() {
    return [...allContacts].sort((contactA, contactB) => contactA.name.localeCompare(contactB.name));
}


/**
 * Groups contacts by the first letter of their name.
 *
 * @param {Array<{ id: string, name: string, email: string, phone: string }>} contacts - The contacts to group.
 * @returns {Object<string, Array<{ id: string, name: string, email: string, phone: string }>>} The grouped contacts.
 */
function groupContactsByFirstLetter(contacts) {
    return contacts.reduce((letterGroups, contact) => {
        const letter = contact.name[0].toUpperCase();
        if (!letterGroups[letter]) letterGroups[letter] = [];
        letterGroups[letter].push(contact);
        return letterGroups;
    }, {});
}


/**
 * Renders grouped contacts into the contact list element.
 *
 * @param {Object<string, Array<{ id: string, name: string, email: string, phone: string }>>} contactGroups - The grouped contacts.
 * @param {HTMLElement} contactListElement - The contact list container.
 * @returns {void}
 */
function renderContactGroups(contactGroups, contactListElement) {
    contactListElement.innerHTML = Object.keys(contactGroups).sort()
        .map(letter => contactGroupHTML(letter, contactGroups[letter]))
        .join('');
}


/* ── Detail ── */
/**
 * Shows the contact detail view in the right panel.
 *
 * @param {{ id: string, name: string, email: string, phone: string }} contact - The contact to show.
 * @returns {void}
 */
function showContactDetail(contact) {
    setActiveContact(contact);
    highlightActiveContact(contact.id);
    renderContactDetailAvatar(contact);
    renderContactDetailInfo(contact);
    openContactDetailLayout();
}


/**
 * Stores the selected contact as active contact.
 *
 * @param {{ id: string, name: string, email: string, phone: string }} contact - The selected contact.
 * @returns {void}
 */
function setActiveContact(contact) {
    activeContact = contact;
}


/**
 * Highlights the selected contact in the contact list.
 *
 * @param {string} contactId - The id of the selected contact.
 * @returns {void}
 */
function highlightActiveContact(contactId) {
    document.querySelectorAll('.contact_item').forEach(contactItem => contactItem.classList.remove('active'));
    const activeContactElement = document.querySelector(`.contact_item[data-id="${contactId}"]`);
    if (activeContactElement) activeContactElement.classList.add('active');
}


/**
 * Renders the avatar and name in the contact detail view.
 *
 * @param {{ name: string }} contact - The contact shown in the detail view.
 * @returns {void}
 */
function renderContactDetailAvatar(contact) {
    const avatarElement = document.querySelector('.crb_avatar');
    avatarElement.textContent = initials(contact.name);
    avatarElement.style.backgroundColor = avatarColor(contact.name);
    document.querySelector('.crb_name').textContent = contact.name;
}


/**
 * Renders email and phone in the contact detail view.
 *
 * @param {{ email: string, phone: string }} contact - The contact shown in the detail view.
 * @returns {void}
 */
function renderContactDetailInfo(contact) {
    const emailLinkElement = document.getElementById('detailEmail');
    emailLinkElement.textContent = contact.email || '—';
    emailLinkElement.href = contact.email ? `mailto:${contact.email}` : '#';

    document.getElementById('detailPhone').textContent = contact.phone || '—';
}


/**
 * Opens the contact detail layout.
 *
 * @returns {void}
 */
function openContactDetailLayout() {
    document.querySelector('.contacts_right_bottom').classList.remove('hidden');
    document.querySelector('.contacts_layout').classList.add('detail_open');
    document.body.classList.add('contact_detail_open');
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
    document.getElementById('editContactName').value = contact.name || '';
    document.getElementById('editContactEmail').value = contact.email || '';
    document.getElementById('editContactPhone').value = contact.phone || '';

    const avatarElement = document.getElementById('editContactAvatar');
    avatarElement.textContent = contact.name ? initials(contact.name) : '';
    avatarElement.style.backgroundColor = contact.name ? avatarColor(contact.name) : '';

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
