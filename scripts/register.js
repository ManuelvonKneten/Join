const acceptCheckbox       = document.getElementById('signupAccept');
const signupBtn            = document.getElementById('signupBtn');
const signupForm           = document.querySelector('form');
const signupNameInput      = document.getElementById('signupName');
const signupEmailInput     = document.getElementById('signupEmail');
const signupPasswordInput  = document.getElementById('signupPassword');
const signupConfirmInput   = document.getElementById('signupConfirmPassword');
const mismatchMsg          = document.getElementById('passwordMismatch');
const nameError            = document.getElementById('nameError');
const emailError           = document.getElementById('emailError');
const passwordError        = document.getElementById('passwordError');
const acceptError          = document.getElementById('acceptError');
const urlParams            = new URLSearchParams(window.location.search);
const messageBox           = document.getElementById('msgBox');
/**
 * Icon paths used by the password visibility toggle.
 *
 * @type {{ lock: string, hidden: string, shown: string }}
 */
const PASSWORD_TOGGLE_ICONS = {
    lock: '../assets/icons/lock.png',
    hidden: '../assets/icons/visibility_off.svg',
    shown: '../assets/icons/visibility.svg',
};


/**
 * Checks whether the entered name contains valid characters and is long enough.
 *
 * @param {string} value - The name value to validate.
 * @returns {boolean} True if the name is valid.
 */
function isValidName(value) {
    return /^[a-zA-ZÄäÖöÜüß\s]+$/.test(value.trim()) && value.trim().length >= 1;
}


/**
 * Checks whether the entered email address has a valid format.
 *
 * @param {string} value - The email value to validate.
 * @returns {boolean} True if the email address is valid.
 */
function isValidEmail(value) {
    const emailRegex = /^[^\s@.][^\s@]*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
    return emailRegex.test(value.trim());
}


/**
 * Checks whether the entered password meets the minimum length requirement.
 *
 * @param {string} value - The password value to validate.
 * @returns {boolean} True if the password is valid.
 */
function isValidPassword(value) {
    return value.trim().length >= 4;
}


/**
 * Validates the name field after it loses focus.
 *
 * @returns {void}
 */
function validateNameOnBlur() {
    setErrorVisible(nameError, !isValidName(signupNameInput.value));
}


/**
 * Validates the name field while typing.
 *
 * @returns {void}
 */
function validateNameOnInput() {
    const value = signupNameInput.value.trim();

    if (value === '') {
        setErrorVisible(nameError, false);
        return;
    }
    setErrorVisible(nameError, !isValidName(value));
}


/**
 * Validates the email field after it loses focus.
 *
 * @returns {void}
 */
function validateEmailOnBlur() {
    setErrorVisible(emailError, !isValidEmail(signupEmailInput.value));
}


/**
 * Validates the password field after it loses focus.
 *
 * @returns {void}
 */
function validatePasswordOnBlur() {
    const passwordOk = isValidPassword(signupPasswordInput.value);
    setErrorVisible(passwordError, !passwordOk);
    setErrorVisible(mismatchMsg, signupConfirmInput.value.length > 0 && (!passwordOk || !passwordsMatch()));
}


/**
 * Validates the confirmation password field after it loses focus.
 *
 * @returns {void}
 */
function validateConfirmPasswordOnBlur() {
    setErrorVisible(mismatchMsg, !isValidPassword(signupPasswordInput.value) || !passwordsMatch());
}


/**
 * Validates whether the privacy policy checkbox has been accepted.
 *
 * @returns {void}
 */
function validateAcceptCheckbox() {
    setErrorVisible(acceptError, !acceptCheckbox.checked);
}


/**
 * Validates all fields in the signup form and updates visible errors.
 *
 * @returns {boolean} True if the signup form is valid.
 */
function validateSignupForm() {
    const nameOk     = isValidName(signupNameInput.value);
    const emailOk    = isValidEmail(signupEmailInput.value);
    const passwordOk = isValidPassword(signupPasswordInput.value);
    const confirmOk  = passwordOk && passwordsMatch();
    const acceptedOk = acceptCheckbox.checked;

    setErrorVisible(nameError, !nameOk);
    setErrorVisible(emailError, !emailOk);
    setErrorVisible(passwordError, !passwordOk);
    setErrorVisible(mismatchMsg, !confirmOk);
    setErrorVisible(acceptError, !acceptedOk);

    return nameOk && emailOk && passwordOk && confirmOk && acceptedOk;
}

if (signupNameInput) {
    signupNameInput.addEventListener('blur', validateNameOnBlur);
    signupNameInput.addEventListener('input', validateNameOnInput);
}

if (signupEmailInput) {
    signupEmailInput.addEventListener('blur', validateEmailOnBlur);
}


/**
 * Checks whether the password and confirmation password fields contain the same value.
 *
 * @returns {boolean} True if both password fields match.
 */
function passwordsMatch() {
    return signupPasswordInput.value === signupConfirmInput.value;
}


if (signupConfirmInput) {
    signupPasswordInput.addEventListener('blur', validatePasswordOnBlur);
    signupConfirmInput.addEventListener('blur', validateConfirmPasswordOnBlur);
}

initPasswordToggle(signupPasswordInput, document.getElementById('signupPasswordToggle'));
initPasswordToggle(signupConfirmInput, document.getElementById('signupConfirmPasswordToggle'));


/**
 * Initializes the password visibility toggle for a password input.
 *
 * @param {HTMLInputElement|null} input - The password input element.
 * @param {HTMLImageElement|null} toggle - The icon element used to toggle visibility.
 * @returns {void}
 */
function initPasswordToggle(input, toggle) {
    if (!input || !toggle) return;

    addPasswordToggleListeners(input, toggle);
    updatePasswordToggleIcon(input, toggle, PASSWORD_TOGGLE_ICONS);
}


/**
 * Adds all event listeners for one password visibility toggle.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The icon element used to toggle visibility.
 * @returns {void}
 */
function addPasswordToggleListeners(input, toggle) {
    input.addEventListener('input', () => updatePasswordToggleIcon(input, toggle, PASSWORD_TOGGLE_ICONS));
    input.addEventListener('blur', () => resetPasswordToggleOnBlur(input, toggle, PASSWORD_TOGGLE_ICONS));
    toggle.addEventListener('click', () => handlePasswordToggleClick(input, toggle, PASSWORD_TOGGLE_ICONS));
}


/**
 * Updates the password toggle icon and input type according to the input value.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The icon element used to toggle visibility.
 * @param {{ lock: string, hidden: string, shown: string }} icons - The icon paths.
 * @returns {void}
 */
function updatePasswordToggleIcon(input, toggle, icons) {
    if (!input.value) {
        input.type = 'password';
                toggle.src = icons.lock;
        toggle.classList.remove('isToggle');
        return;
    }
    toggle.classList.add('isToggle');
    toggle.src = input.type === 'password' ? icons.hidden : icons.shown;
}


/**
 * Resets the password toggle when the input loses focus and is empty.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The icon element used to toggle visibility.
 * @param {{ lock: string, hidden: string, shown: string }} icons - The icon paths.
 * @returns {void}
 */
function resetPasswordToggleOnBlur(input, toggle, icons) {
    if (!input.value) updatePasswordToggleIcon(input, toggle, icons);
}


/**
 * Toggles the password input visibility when the icon is clicked.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The icon element used to toggle visibility.
 * @param {{ lock: string, hidden: string, shown: string }} icons - The icon paths.
 * @returns {void}
 */
function handlePasswordToggleClick(input, toggle, icons) {
    if (!input.value) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    updatePasswordToggleIcon(input, toggle, icons);
    input.focus();
}


/**
 * Updates the signup button state and validates the accept checkbox.
 *
 * @returns {void}
 */
function handleAcceptCheckboxChange() {
    signupBtn.disabled = !acceptCheckbox.checked;
    validateAcceptCheckbox();
}


/**
 * Handles signup form submission and creates the user when the form is valid.
 *
 * @param {SubmitEvent} e - The submit event from the signup form.
 * @returns {void}
 */
function handleSignupFormSubmit(e) {
    e.preventDefault();
    if (!validateSignupForm()) return;
    addUser();
}


if (acceptCheckbox) {
    acceptCheckbox.addEventListener('change', handleAcceptCheckboxChange);
}

if (signupForm) {
    signupForm.addEventListener('submit', handleSignupFormSubmit);
}

if (messageBox && urlParams.get('msg')) {
    messageBox.textContent = urlParams.get('msg');
}


/**
 * Reads the signup form, stores the new user, and redirects after success.
 *
 * @async
 * @returns {Promise<void>}
 */
async function addUser() {
    if (!validateSignupForm()) return;

    const formData = getRegisterFormData();

    try {
        await postToDB('users', formData);
        onUserRegistered();
    } catch {
        showRegisterError('Registration failed. Please try again.');
    }
}


/**
 * Reads name, email, and password from the signup form.
 *
 * @returns {{ name: string, email: string, password: string }} The signup form data.
 */
function getRegisterFormData() {
    return {
        name:     signupNameInput.value.trim(),
        email:    signupEmailInput.value.trim(),
        password: signupPasswordInput.value
    };
}


/**
 * Shows the success toast and redirects to the login page after a short delay.
 *
 * @returns {void}
 */
function onUserRegistered() {
    const signupToast = document.getElementById('signupToast');
    signupToast.classList.add('show');
    setTimeout(redirectToLogin, 2500);
}


/**
 * Redirects the user to the login page with the registration message.
 *
 * @returns {void}
 */
function redirectToLogin() {
    window.location.href = '../index.html?msg=registered';
}


/**
 * Shows an error toast message for a short time.
 *
 * @param {string} message - The error message to display.
 * @returns {void}
 */
function showRegisterError(message) {
    const signupToast = document.getElementById('signupToast');
    signupToast.textContent = message;
    signupToast.classList.add('show', 'toast_error');
    setTimeout(hideRegisterErrorToast, 3000, signupToast);
}


/**
 * Hides the registration error toast.
 *
 * @param {HTMLElement} signupToast - The registration toast element.
 * @returns {void}
 */
function hideRegisterErrorToast(signupToast) {
    signupToast.classList.remove('show', 'toast_error');
}


