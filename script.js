/* ── Helpers ── */
/**
 * Gibt die Initialen eines Namens zurück — erster Buchstabe jedes Wortes in Großschreibung.
 *
 * @function initials
 * @param {string} name - Vollständiger Name
 * @returns {string} Initialen, z.B. "MvK" für "Manuel von Kneten"
 */
function initials(name) {
    return name.trim()
        .split(/\s+/)
        .map(word => word[0].toUpperCase())
        .join('');
}