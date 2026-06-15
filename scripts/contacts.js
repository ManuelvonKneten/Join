/* ── State ── */
let allContacts = [];
let activeContact = null;


/* ── Init ── */
document.addEventListener('DOMContentLoaded', loadContacts);
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('addContactOverlay').classList.contains('hidden')) closeAddContact();
    else if (!document.getElementById('editContactOverlay').classList.contains('hidden')) closeEditContact();
});


/* ── CRUD ── */
/**
 * Lädt alle Kontakte aus der Datenbank in den lokalen State und rendert die Liste.
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
 * Erstellt einen neuen Kontakt, speichert ihn in der Datenbank und aktualisiert die UI.
 *
 * @async
 * @param {Event} event - Submit-Event des Formulars
 * @returns {Promise<void>}
 */
async function createContact(event) {
    event.preventDefault();

    const formData = getContactFormData();
    setCreateButtonLoading(event.target, true);

    try {
        const newId = await postContact(formData);
        addContactToState(newId, formData);
        onContactCreated();
    } catch {
        showContactToast('Something went wrong. Please try again.', true);
    } finally {
        setCreateButtonLoading(event.target, false);
    }
}

/**
 * @returns {{ name: string, email: string, phone: string }}
 */
function getContactFormData() {
    return {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim()
    };
}

/**
 * @param {HTMLFormElement} form
 * @param {boolean} isLoading
 */
function setCreateButtonLoading(form, isLoading) {
    const createButton = form.querySelector('.btn_modal_create');
    createButton.disabled = isLoading;
    createButton.textContent = isLoading ? 'Saving…' : 'Create contact ✓';
}

/**
 * @async
 * @param {{ name: string, email: string, phone: string }} contactData
 * @returns {Promise<string>} Firebase-generierte ID
 * @throws {Error} Bei fehlgeschlagenem Request
 */
async function postContact(contactData) {
    const firebaseResponse = await postToDB('contacts', contactData);
    return firebaseResponse.name; // Firebase ID
}

/**
 * @param {string} id
 * @param {{ name: string, email: string, phone: string }} contactData
 */
function addContactToState(id, contactData) {
    allContacts.push({ id, ...contactData });
}

function onContactCreated() {
    renderContacts();
    closeAddContact();
    showContactToast('Contact successfully created');
}

/**
 * Speichert geänderte Kontaktdaten in der Datenbank und aktualisiert State und UI.
 *
 * @async
 * @param {Event} event - Submit-Event des Edit-Formulars
 * @returns {Promise<void>}
 */
async function saveContact(event) {
    event.preventDefault();
    if (!activeContact) return;

    const updatedContactData = {
        name: document.getElementById('editContactName').value.trim(),
        email: document.getElementById('editContactEmail').value.trim(),
        phone: document.getElementById('editContactPhone').value.trim(),
    };

    try {
        await patchToDB(`contacts/${activeContact.id}`, updatedContactData);

        Object.assign(activeContact, updatedContactData);
        const activeContactIndex = allContacts.findIndex(contact => contact.id === activeContact.id);
        if (activeContactIndex !== -1) allContacts[activeContactIndex] = { ...activeContact };

        renderContacts();
        showContactDetail(activeContact);
        closeEditContact();
        showContactToast('Contact updated');
    } catch {
        showContactToast('Could not save contact.', true);
    }
}

/**
 * Löscht den aktiven Kontakt aus der Datenbank, dem State und der UI.
 *
 * @async
 * @returns {Promise<void>}
 */
async function deleteContact() {
    if (!activeContact) return;

    try {
        await deleteFromDB(`contacts/${activeContact.id}`);

        allContacts = allContacts.filter(contact => contact.id !== activeContact.id);
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
 * Rendert alle Kontakte alphabetisch gruppiert in die Liste.
 * Bei leerem State wird ein Hinweistext angezeigt.
 *
 * @returns {void}
 */
function renderContacts() {
    const contactListElement = document.getElementById('contactList');

    if (!allContacts.length) {
        contactListElement.innerHTML = '<p class="no_contacts">No contacts yet.</p>';
        return;
    }

    const sortedContacts = [...allContacts].sort((contactA, contactB) => contactA.name.localeCompare(contactB.name));

    const contactGroups = sortedContacts.reduce((letterGroups, contact) => {
        const letter = contact.name[0].toUpperCase();
        if (!letterGroups[letter]) letterGroups[letter] = [];
        letterGroups[letter].push(contact);
        return letterGroups;
    }, {});

    contactListElement.innerHTML = Object.keys(contactGroups).sort()
        .map(letter => contactGroupHTML(letter, contactGroups[letter]))
        .join('');
}


/* ── Detail ── */
/**
 * Zeigt die Detailansicht eines Kontakts im rechten Panel an.
 *
 * @param {{ id: string, name: string, email: string, phone: string }} contact
 */
function showContactDetail(contact) {
    activeContact = contact;

    document.querySelectorAll('.contact_item').forEach(contactItem => contactItem.classList.remove('active'));
    const activeContactElement = document.querySelector(`.contact_item[data-id="${contact.id}"]`);
    if (activeContactElement) activeContactElement.classList.add('active');

    const avatarElement = document.querySelector('.crb_avatar');
    avatarElement.textContent = initials(contact.name);
    avatarElement.style.backgroundColor = avatarColor(contact.name);
    document.querySelector('.crb_name').textContent = contact.name;

    const emailLinkElement = document.getElementById('detailEmail');
    emailLinkElement.textContent = contact.email || '—';
    emailLinkElement.href = contact.email ? `mailto:${contact.email}` : '#';

    document.getElementById('detailPhone').textContent = contact.phone || '—';
    document.querySelector('.contacts_right_bottom').classList.remove('hidden');
    document.querySelector('.contacts_layout').classList.add('detail_open');
    document.body.classList.add('contact_detail_open');
}

function closeContactDetail() {
    document.querySelector('.contacts_layout').classList.remove('detail_open');
    document.querySelector('.contacts_right_bottom').classList.add('hidden');
    document.querySelectorAll('.contact_item').forEach(item => item.classList.remove('active'));
    document.body.classList.remove('contact_detail_open');
    activeContact = null;
}


/* ── Modals ── */
/**
 * @returns {void}
 */
function openAddContact() {
    document.getElementById('addContactOverlay').classList.remove('hidden');
}

/**
 * Schließt das Add-Modal und setzt alle Felder zurück.
 *
 * @returns {void}
 */
function closeAddContact() {
    document.getElementById('addContactOverlay').classList.add('hidden');
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
}

/**
 * Schließt das Add-Modal bei Klick auf den Overlay-Hintergrund.
 *
 * @param {MouseEvent} event
 */
function overlayClose(event) {
    if (event.target === document.getElementById('addContactOverlay')) {
        closeAddContact();
    }
}

/**
 * @param {{ name: string, email: string, phone: string }} contact
 */
function openEditContact(contact) {
    document.getElementById('editContactName').value = contact.name || '';
    document.getElementById('editContactEmail').value = contact.email || '';
    document.getElementById('editContactPhone').value = contact.phone || '';

    const avatarElement = document.getElementById('editContactAvatar');
    avatarElement.textContent = contact.name ? initials(contact.name) : '';
    avatarElement.style.backgroundColor = contact.name ? avatarColor(contact.name) : '';

    document.getElementById('editContactOverlay').classList.remove('hidden');
}

/**
 * @returns {void}
 */
function closeEditContact() {
    document.getElementById('editContactOverlay').classList.add('hidden');
}

/**
 * Schließt das Edit-Modal bei Klick auf den Overlay-Hintergrund.
 *
 * @param {MouseEvent} event
 */
function overlayEditClose(event) {
    if (event.target === document.getElementById('editContactOverlay')) {
        closeEditContact();
    }
}


/* ── Toast ── */
/**
 * Zeigt eine Toast-Nachricht für 3 Sekunden an.
 *
 * @param {string} message
 * @param {boolean} [isError=false] - true = roter Toast
 */
function showContactToast(message, isError = false) {
    const toast = document.getElementById('contactToast');
    toast.textContent = message;
    toast.classList.toggle('toast_error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
