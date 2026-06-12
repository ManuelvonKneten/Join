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
    window.location.replace('/htmls/login.html');
}

