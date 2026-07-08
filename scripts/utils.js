let showAllAvatarsAddTask = false;
let showAllAvatarsEditTask = false;

const AVATAR_COLORS = [
    '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
    '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#FFE62B',
    '#FF4646', '#FFBB2B', '#C3FF2B'
];

/**
 * Returns the initials of a name (e.g. "Max Mustermann" → "MM").
 *
 * @param {string} name
 * @returns {string}
 */
function initials(name) {
    
    if (typeof name !== "string") return ""; 

    return name.trim().split(/\s+/).map(word => word[0].toUpperCase()).join('');
}

/**
 * Returns a consistent avatar color for a name.
 * The same name always yields the same color.
 *
 * @param {string} name
 * @returns {string} Hex color value
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
 * Shows a toast message for 3 seconds.
 *
 * @param {string} message
 * @param {boolean} [isError=false] - true = red toast
 * @returns {void}
 */
function showTaskToast(message, isError = false) {
    const toastElement = document.getElementById('addTaskToast');
    toastElement.textContent = message;
    toastElement.classList.toggle('toast_error', isError);
    toastElement.classList.add('show');
    setTimeout(() => toastElement.classList.remove('show'), 3000);
}


/**
 * Builds HTML for contact avatars.
 *
 * Creates avatar elements from assigned contact IDs and optionally displays
 * contact names. The number of visible avatars depends on the screen width
 * unless a custom maximum value is provided.
 *
 * @param {Array|string|number} contactIds - The IDs of the contacts to display.
 * @param {Array<Object>} availableContacts - List of available contacts with their IDs and names.
 * @param {boolean} [showAll=false] - Whether all contacts should be displayed.
 * @param {boolean} [showName=false] - Whether contact names should be shown next to avatars.
 * @param {number} [max=window.innerWidth <= 1024 ? 2 : 4] - Maximum number of avatars to display when not showing all.
 * @returns {string} HTML string containing the generated avatars.
 */
function buildAvatarsHTML(contactIds, availableContacts, showAll = false, showName = false, max = window.innerWidth <= 1024 ? 2 : 4) {
    if (!Array.isArray(contactIds)) {
        contactIds = contactIds ? [contactIds]: [];
    }
    const visible = showAll ? contactIds : contactIds.slice(0, max);

    let html = visible.map(entry => {
        const contact = availableContacts.find(c => c.id === entry);
        const name = contact ? contact.name : entry;
        return getContactsAvatar(name, showName);
    }).join('');

    if (!showAll && contactIds.length > max) {
        html += `<div class="more_contacts js_more_avatars">+${contactIds.length - max}</div>`;
    }
    return html;
}


/**
 * Shows or hides a validation error element.
 *
 * @param {HTMLElement|null} errorElement - Error element.
 * @param {boolean} visible - Whether error should be visible.
 * @returns {void}
 */
function setErrorVisible(errorElement, visible) {
    if (errorElement) {
        errorElement.classList.toggle('visible', visible);
    }
}