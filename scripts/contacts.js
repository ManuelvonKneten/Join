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
 * Creates a new contact, saves it in the database, and updates the UI.
 *
 * @async
 * @param {Event} event - The submit event from the add contact form.
 * @returns {Promise<void>}
 */
async function createContact(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim()
    };
    setCreateButtonLoading(event.target, true);

    try {
        const response = await postToDB('contacts', formData);
        allContacts.push({ id: response.name, ...formData });
        renderContacts();
        closeAddContact();
        showContactToast('Contact successfully created');
    } catch {
        showContactToast('Something went wrong. Please try again.', true);
    } finally {
        setCreateButtonLoading(event.target, false);
    }
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
 * Saves changed contact data in the database and updates state and UI.
 *
 * @async
 * @param {Event} event - The submit event from the edit contact form.
 * @returns {Promise<void>}
 */
async function saveContact(event) {
    event.preventDefault();
    if (!activeContact) return;

    const updated = {
        name: document.getElementById('editContactName').value.trim(),
        email: document.getElementById('editContactEmail').value.trim(),
        phone: document.getElementById('editContactPhone').value.trim(),
    };

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
    if (!allContacts.length) {
        list.innerHTML = '<p class="no_contacts">No contacts yet.</p>';
        return;
    }

    const sorted = [...allContacts].sort((a, b) => a.name.localeCompare(b.name));
    const groups = sorted.reduce((acc, contact) => {
        const letter = contact.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(contact);
        return acc;
    }, {});
    list.innerHTML = Object.keys(groups).sort()
        .map(letter => contactGroupHTML(letter, groups[letter]))
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
    activeContact = contact;

    document.querySelectorAll('.contact_item').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.contact_item[data-id="${contact.id}"]`);
    if (activeEl) activeEl.classList.add('active');

    const avatar = document.querySelector('.crb_avatar');
    avatar.textContent = initials(contact.name);
    avatar.style.backgroundColor = avatarColor(contact.name);
    document.querySelector('.crb_name').textContent = contact.name;

    const emailLink = document.getElementById('detailEmail');
    emailLink.textContent = contact.email || '—';
    emailLink.href = contact.email ? `mailto:${contact.email}` : '#';
    document.getElementById('detailPhone').textContent = contact.phone || '—';

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
