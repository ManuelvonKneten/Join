/* ── Contact form validation ── */
/**
 * Initializes blur validation for the add and edit contact forms.
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
 * Hides all add contact form error messages.
 *
 * @returns {void}
 */
function hideAllContactErrors() {
    ['contactNameError', 'contactEmailError', 'contactPhoneError']
        .forEach(id => setErrorVisible(document.getElementById(id), false));
}


/**
 * Hides all edit contact form error messages.
 *
 * @returns {void}
 */
function hideAllEditContactErrors() {
    ['editContactNameError', 'editContactEmailError', 'editContactPhoneError']
        .forEach(id => setErrorVisible(document.getElementById(id), false));
}
