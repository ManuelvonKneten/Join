/* ── Shared field validators (used by signup and contact forms) ── */
/**
 * Checks whether a value contains only letters (incl. umlauts) and spaces.
 *
 * @param {string} value - The value to validate.
 * @returns {boolean} True if the value contains only valid name characters.
 */
function isValidName(value) {
    return /^[a-zA-ZÄäÖöÜüß\s]+$/.test(value.trim()) && value.trim().length >= 1;
}


/**
 * Checks whether a value has a valid email address format.
 *
 * @param {string} value - The value to validate.
 * @returns {boolean} True if the value is a valid email address.
 */
function isValidEmail(value) {
    const emailRegex = /^[^\s@.][^\s@]*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
    return emailRegex.test(value.trim());
}


/**
 * Checks whether a value contains only phone characters.
 *
 * Allows an optional leading plus sign, digits and spaces.
 *
 * @param {string} value - The value to validate.
 * @returns {boolean} True if the value is a valid phone number.
 */
function isValidPhone(value) {
    return /^\+?[0-9\s]+$/.test(value.trim());
}


/**
 * Checks whether a password meets the minimum length requirement.
 *
 * @param {string} value - The value to validate.
 * @returns {boolean} True if the password is long enough.
 */
function isValidPassword(value) {
    return value.trim().length >= 4;
}
