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
        Name: isValidName,
        Email: isValidEmail,
        Phone: isValidPhone,
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
        ['Name', isValidName],
        ['Email', isValidEmail],
        ['Phone', isValidPhone],
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
