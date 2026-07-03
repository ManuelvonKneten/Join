let showAllAvatarsAddTask = false;
let showAllAvatarsEditTask = false;

const AVATAR_COLORS = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
    '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#FFE62B',
    '#FF4646', '#FFBB2B', '#C3FF2B'
];

/**
 * Gibt die Initialen eines Namens zurück (z.B. "Max Mustermann" → "MM").
 *
 * @param {string} name
 * @returns {string}
 */
function initials(name) {
    
    if (typeof name !== "string") return ""; 

    return name.trim().split(/\s+/).map(word => word[0].toUpperCase()).join('');
}

/**
 * Gibt eine konsistente Avatar-Farbe für einen Namen zurück.
 * Der gleiche Name liefert immer die gleiche Farbe.
 *
 * @param {string} name
 * @returns {string} Hex-Farbwert
 */
function avatarColor(name) {

    if (typeof name !== "string") name = "";

    let hash = 0;
    for (const character of name) hash += character.charCodeAt(0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * Clears the current user session from localStorage and redirects to login.
 *
 * @returns {void}
 */
function clearLocalStorage() {
    localStorage.removeItem('currentUser');
    window.location.replace('../index.html');
}


/* ── Toast ── */
/**
 * Zeigt eine Toast-Nachricht für 3 Sekunden an.
 *
 * @param {string} message
 * @param {boolean} [isError=false] - true = roter Toast
 * @returns {void}
 */
function showTaskToast(message, isError = false) {
    const toastElement = document.getElementById('addTaskToast');
    toastElement.textContent = message;
    toastElement.classList.toggle('toast_error', isError);
    toastElement.classList.add('show');
    setTimeout(() => toastElement.classList.remove('show'), 3000);
}


function buildAvatarsHTML(contactIds, availableContacts, showAll = false, showName = false) {
    if (!Array.isArray(contactIds)) {
        contactIds = contactIds ? [contactIds]: [];
    } 
        const visible = showAll ? contactIds : contactIds.slice(0, 4);

    let html = visible.map(entry => {
        const contact = availableContacts.find(c => c.id === entry);
        const name = contact ? contact.name : entry;
        return getContactsAvatar(name, showName);
    }).join('');

    if (!showAll && contactIds.length > 4) {
        html += `<div class="more_contacts js_more_avatars">+${contactIds.length - 4}</div>`;
    }
    return html;
}


function showAllAssignedAvatars() {
    showAllAvatars = true;
    renderSelectedAvatars();
}

