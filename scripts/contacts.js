const DB_URL = 'https://join-project-e7af3-default-rtdb.europe-west1.firebasedatabase.app';

const AVATAR_COLORS = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
    '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#FFE62B',
    '#FF4646', '#FFBB2B', '#C3FF2B'
];

let allContacts = [];
let activeContact = null;


/* ── Init ── */
document.addEventListener('DOMContentLoaded', loadContacts);


/* ── Firebase ── */
/**
 * Lädt alle Kontakte aus der Datenbank und bereitet sie für die Anzeige auf.
 *
 * Ablauf:
 * - Holt die Kontakt-Daten von der API
 * - Wandelt das JSON in ein nutzbares Array um
 * - Fügt die ID jedes Kontakts in das Objekt ein
 * - Speichert das Ergebnis in allContacts
 * - Rendert anschließend die Kontaktliste im UI
 *
 * Falls ein Fehler auftritt, wird eine Fehlermeldung angezeigt.
 *
 * @async
 * @function loadContacts
 * @returns {Promise<void>} Keine Rückgabe, nur Seiteneffekte (State + UI Update)
 */
async function loadContacts() {
    try {
        const response = await fetch(`${DB_URL}/contacts.json`);
        if (!response.ok) throw new Error('Firebase error');
        const data = await response.json();
        allContacts = data
            ? Object.entries(data).map(([id, c]) => ({ id, ...c }))
            : [];
        renderContacts();
    } catch {
        showContactToast('Could not load contacts.', true);
    }
}

/**
 * Erstellt einen neuen Kontakt und speichert ihn in der Datenbank.
 *
 * - Verhindert das Standard-Formularverhalten
 * - Liest Name, E-Mail und Telefonnummer aus dem Formular
 * - Sendet die Daten an die API (POST Request)
 * - Fügt den neu erstellten Kontakt lokal zur Kontaktliste hinzu
 * - Aktualisiert die UI
 * - Schließt das Formular nach erfolgreichem Speichern
 *
 * Während des Speicherns wird der Button deaktiviert, um Mehrfachklicks zu verhindern.
 *
 * @async
 * @function createContact
 * @param {Event} event - Submit-Event des Formulars
 * @returns {Promise<void>}
 */
async function createContact(event) {
    event.preventDefault();

    const formData = getContactFormData();
    const createBtn = setCreateButtonLoading(event.target, true);

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
 * Liest Name, E-Mail und Telefon aus dem Formular und gibt sie als Objekt zurück.
 *
 * @function getContactFormData
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
 * Setzt den Create-Button in den Lade- oder Normalzustand.
 *
 * @function setCreateButtonLoading
 * @param {HTMLFormElement} form - Das Formular, das den Button enthält
 * @param {boolean} isLoading - true = deaktiviert & Ladetext, false = aktiv & Normaltext
 * @returns {HTMLButtonElement} Der betroffene Button
 */
function setCreateButtonLoading(form, isLoading) {
    const btn = form.querySelector('.btn_modal_create');

    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Saving…' : 'Create contact ✓';

    return btn;
}

/**
 * Sendet einen neuen Kontakt per POST an Firebase und gibt die generierte ID zurück.
 *
 * @async
 * @function postContact
 * @param {{ name: string, email: string, phone: string }} data - Kontaktdaten
 * @returns {Promise<string>} Die von Firebase generierte ID
 * @throws {Error} Bei einem fehlgeschlagenen Request
 */
async function postContact(data) {
    const response = await fetch(`${DB_URL}/contacts.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Request failed');

    const result = await response.json();
    return result.name; // Firebase ID
}

/**
 * Fügt einen neuen Kontakt mit seiner Firebase-ID zum lokalen State hinzu.
 *
 * @function addContactToState
 * @param {string} id - Die von Firebase generierte ID
 * @param {{ name: string, email: string, phone: string }} data - Kontaktdaten
 * @returns {void}
 */
function addContactToState(id, data) {
    allContacts.push({ id, ...data });
}

/**
 * Wird nach erfolgreichem Erstellen eines Kontakts aufgerufen.
 * Aktualisiert die Liste, schließt das Modal und zeigt einen Toast.
 *
 * @function onContactCreated
 * @returns {void}
 */
function onContactCreated() {
    renderContacts();
    closeAddContact();
    showContactToast('Contact successfully created');
}


/* ── Render ── */
/**
 * Rendert alle Kontakte aus allContacts alphabetisch gruppiert in die Kontaktliste.
 * Bei leerer Liste wird ein Hinweistext angezeigt.
 *
 * @function renderContacts
 * @returns {void}
 */
function renderContacts() {
    const list = document.getElementById('contactList');

    if (!allContacts.length) {
        list.innerHTML = '<p class="no_contacts">No contacts yet.</p>';
        return;
    }

    const sorted = [...allContacts].sort((a, b) => a.name.localeCompare(b.name));

    const groups = sorted.reduce((acc, contact) => {
        const letter = contact.name[0].toUpperCase();
        (acc[letter] ??= []).push(contact);
        return acc;
    }, {});

    list.innerHTML = Object.keys(groups).sort().map(letter => `
        <div class="contact_group">
            <span class="contact_group_letter">${letter}</span>
            <div class="contact_group_divider"></div>
            ${groups[letter].map(contactItemHTML).join('')}
        </div>
    `).join('');
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


function showContactDetail(contact) {
    activeContact = contact;
    document.querySelectorAll('.contact_item').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.contact_item[data-id="${contact.id}"]`);
    if (activeEl) activeEl.classList.add('active');
    const panel = document.querySelector('.contacts_right_bottom');
    document.querySelector('.crb_avatar').textContent            = initials(contact.name);
    document.querySelector('.crb_avatar').style.backgroundColor  = avatarColor(contact.name);
    document.querySelector('.crb_name').textContent              = contact.name;
    const emailEl = document.getElementById('detailEmail');
    emailEl.textContent = contact.email || '—';
    emailEl.href        = contact.email ? `mailto:${contact.email}` : '#';
    document.getElementById('detailPhone').textContent = contact.phone || '—';
    panel.classList.remove('hidden');
}


/* ── Helpers ── */
/**
 * Berechnet eine deterministische Farbe aus AVATAR_COLORS anhand des Namens.
 * Gleicher Name ergibt immer dieselbe Farbe.
 *
 * @function avatarColor
 * @param {string} name - Name des Kontakts
 * @returns {string} Hex-Farbwert, z.B. "#FF7A00"
 */
function avatarColor(name) {
    let hash = 0;
    for (const ch of name) hash += ch.charCodeAt(0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}


/* ── Modal ── */
/**
 * Öffnet das Add-Contact-Modal.
 *
 * @function openAddContact
 * @returns {void}
 */
function openAddContact() {
    document.getElementById('addContactOverlay').classList.remove('hidden');
}

/**
 * Schließt das Add-Contact-Modal und setzt alle Formularfelder zurück.
 *
 * @function closeAddContact
 * @returns {void}
 */
function closeAddContact() {
    document.getElementById('addContactOverlay').classList.add('hidden');
    document.getElementById('contactName').value  = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
}

/**
 * Schließt das Modal bei Klick auf den Overlay-Hintergrund.
 *
 * @function overlayClose
 * @param {MouseEvent} event - Klick-Event auf dem Overlay
 * @returns {void}
 */
function overlayClose(event) {
    if (event.target === document.getElementById('addContactOverlay')) {
        closeAddContact();
    }
}


/* ── Edit Modal ── */
function openEditContact(contact) {
    document.getElementById('editContactName').value  = contact.name  || '';
    document.getElementById('editContactEmail').value = contact.email || '';
    document.getElementById('editContactPhone').value = contact.phone || '';
    document.getElementById('editContactOverlay').classList.remove('hidden');
}

function closeEditContact() {
    document.getElementById('editContactOverlay').classList.add('hidden');
}

function overlayEditClose(event) {
    if (event.target === document.getElementById('editContactOverlay')) {
        closeEditContact();
    }
}

async function saveContact(event) {
    event.preventDefault();
    if (!activeContact) return;

    const updated = {
        name:  document.getElementById('editContactName').value.trim(),
        email: document.getElementById('editContactEmail').value.trim(),
        phone: document.getElementById('editContactPhone').value.trim(),
    };

    try {
        const res = await fetch(`${DB_URL}/contacts/${activeContact.id}.json`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(updated),
        });
        if (!res.ok) throw new Error();

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

async function deleteContact() {
    if (!activeContact) return;

    try {
        const res = await fetch(`${DB_URL}/contacts/${activeContact.id}.json`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error();

        allContacts = allContacts.filter(c => c.id !== activeContact.id);
        activeContact = null;

        document.querySelectorAll('.contact_item').forEach(el => el.classList.remove('active'));
        renderContacts();
        document.querySelector('.contacts_right_bottom').classList.add('hidden');
        closeEditContact();
        showContactToast('Contact deleted');
    } catch {
        showContactToast('Could not delete contact.', true);
    }
}


/**
 * Zeigt eine kurze Toast-Nachricht im UI an.
 *
 * Die Nachricht wird im Toast-Element gesetzt und eingeblendet.
 * Optional kann der Fehlerzustand aktiviert werden, wodurch ein anderes Styling verwendet wird.
 * Nach 3 Sekunden wird der Toast automatisch wieder ausgeblendet.
 *
 * @function showContactToast
 * @param {string} message - Die anzuzeigende Nachricht
 * @param {boolean} [isError=false] - Gibt an, ob es sich um eine Fehlermeldung handelt
 * @returns {void}
 */
function showContactToast(message, isError = false) {
    const toast = document.getElementById('contactToast');
    toast.textContent = message;
    toast.classList.toggle('toast_error', isError);
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
