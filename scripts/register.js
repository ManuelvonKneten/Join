/**
 * Checkbox for accepting the privacy policy.
 * @type {HTMLInputElement}
 */
let acceptCheckbox;

/**
 * Sign-up submit button.
 * @type {HTMLButtonElement}
 */
let signupBtn;

/**
 * Sign-up form.
 * @type {HTMLFormElement}
 */
let signupForm;

/**
 * Name input field.
 * @type {HTMLInputElement}
 */
let signupNameInput;

/**
 * Email input field.
 * @type {HTMLInputElement}
 */
let signupEmailInput;

/**
 * Password input field.
 * @type {HTMLInputElement}
 */
let signupPasswordInput;

/**
 * Password confirmation input field.
 * @type {HTMLInputElement}
 */
let signupConfirmInput;

/**
 * Password mismatch message element.
 * @type {HTMLElement}
 */
let mismatchMsg;

/**
 * Name validation error message.
 * @type {HTMLElement}
 */
let nameError;

/**
 * Email validation error message.
 * @type {HTMLElement}
 */
let emailError;

/**
 * Password validation error message.
 * @type {HTMLElement}
 */
let passwordError;

/**
 * Privacy policy validation error message.
 * @type {HTMLElement}
 */
let acceptError;

/**
 * URL query parameters.
 * @type {URLSearchParams}
 */
const urlParams = new URLSearchParams(window.location.search);

/**
 * Message box element.
 * @type {HTMLElement}
 */
let messageBox;


/**
 * Initializes the register page: elements, listeners, toggles and query message.
 *
 * @returns {void}
 */
function initRegister() {
    initRegisterElements();
    initRegisterEventListeners();
    initRegisterPasswordToggles();
    showRegisterQueryMessage();
}


/**
 * Caches the main register DOM elements (checkbox, button, form, inputs, errors).
 *
 * @returns {void}
 */
function initRegisterElements() {
    acceptCheckbox = document.getElementById('signupAccept');
    signupBtn = document.getElementById('signupBtn');
    signupForm = document.querySelector('form');
    initRegisterInputElements();
    initRegisterErrorElements();
    messageBox = document.getElementById('msgBox');
}


/**
 * Caches the signup input elements (name, email, password, confirm).
 *
 * @returns {void}
 */
function initRegisterInputElements() {
    signupNameInput = document.getElementById('signupName');
    signupEmailInput = document.getElementById('signupEmail');
    signupPasswordInput = document.getElementById('signupPassword');
    signupConfirmInput = document.getElementById('signupConfirmPassword');
}


/**
 * Caches the signup error message elements.
 *
 * @returns {void}
 */
function initRegisterErrorElements() {
    mismatchMsg = document.getElementById('passwordMismatch');
    nameError = document.getElementById('nameError');
    emailError = document.getElementById('emailError');
    passwordError = document.getElementById('passwordError');
    acceptError = document.getElementById('acceptError');
}


/**
 * Registers all signup field and submit event listeners.
 *
 * @returns {void}
 */
function initRegisterEventListeners() {
    initRegisterNameEventListeners();
    initRegisterEmailEventListeners();
    initRegisterPasswordEventListeners();
    initRegisterSubmitEventListeners();
}


/**
 * Adds blur and input validation listeners to the name field.
 *
 * @returns {void}
 */
function initRegisterNameEventListeners() {
    if (signupNameInput) {
        signupNameInput.addEventListener('blur', validateNameOnBlur);
        signupNameInput.addEventListener('input', validateNameOnInput);
    }
}


/**
 * Adds a blur validation listener to the email field.
 *
 * @returns {void}
 */
function initRegisterEmailEventListeners() {
    if (signupEmailInput) {
        signupEmailInput.addEventListener('blur', validateEmailOnBlur);
    }
}


/**
 * Adds blur validation listeners to the password and confirm fields.
 *
 * @returns {void}
 */
function initRegisterPasswordEventListeners() {
    if (signupPasswordInput && signupConfirmInput) {
        signupPasswordInput.addEventListener('blur', validatePasswordOnBlur);
        signupConfirmInput.addEventListener('blur', validateConfirmPasswordOnBlur);
    }
}


/**
 * Adds change and submit listeners for the accept checkbox and signup form.
 *
 * @returns {void}
 */
function initRegisterSubmitEventListeners() {
    if (acceptCheckbox) {
        acceptCheckbox.addEventListener('change', handleAcceptCheckboxChange);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupFormSubmit);
    }
}


/**
 * Wires up the show/hide toggles for the password and confirm fields.
 *
 * @returns {void}
 */
function initRegisterPasswordToggles() {
    if (signupPasswordInput) {
        initPasswordToggle(signupPasswordInput, document.getElementById('signupPasswordToggle'));
    }

    if (signupConfirmInput) {
        initPasswordToggle(signupConfirmInput, document.getElementById('signupConfirmPasswordToggle'));
    }
}


/**
 * Displays a message from the URL "msg" query parameter, if present.
 *
 * @returns {void}
 */
function showRegisterQueryMessage() {
    if (messageBox && urlParams.get('msg')) {
        messageBox.textContent = urlParams.get('msg');
    }
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
    const validation = getSignupValidationState();
    showSignupValidationErrors(validation);
    return Object.values(validation).every(Boolean);
}


/**
 * Computes the validation state of all signup fields.
 *
 * @returns {{nameOk: boolean, emailOk: boolean, passwordOk: boolean, confirmOk: boolean, acceptedOk: boolean}} Validation flags per field.
 */
function getSignupValidationState() {
    const passwordOk = isValidPassword(signupPasswordInput.value);
    return {
        nameOk: isValidName(signupNameInput.value),
        emailOk: isValidEmail(signupEmailInput.value),
        passwordOk,
        confirmOk: passwordOk && passwordsMatch(),
        acceptedOk: acceptCheckbox.checked
    };
}


/**
 * Toggles the visibility of all signup error messages based on the validation state.
 *
 * @param {{nameOk: boolean, emailOk: boolean, passwordOk: boolean, confirmOk: boolean, acceptedOk: boolean}} validation - Validation flags per field.
 * @returns {void}
 */
function showSignupValidationErrors(validation) {
    setErrorVisible(nameError, !validation.nameOk);
    setErrorVisible(emailError, !validation.emailOk);
    setErrorVisible(passwordError, !validation.passwordOk);
    setErrorVisible(mismatchMsg, !validation.confirmOk);
    setErrorVisible(acceptError, !validation.acceptedOk);
}

/**
 * Checks whether the password and confirmation password fields contain the same value.
 *
 * @returns {boolean} True if both password fields match.
 */
function passwordsMatch() {
    return signupPasswordInput.value === signupConfirmInput.value;
}


/**
 * Updates the signup button state and validates the accept checkbox.
 *
 * @returns {void}
 */
function handleAcceptCheckboxChange() {
    if (signupBtn) signupBtn.disabled = !acceptCheckbox.checked;
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


/**
 * Registers the DOMContentLoaded listener that starts the register page.
 *
 * @returns {void}
 */
function initRegisterOnLoad() {
    window.addEventListener('DOMContentLoaded', initRegister);
}

initRegisterOnLoad();
