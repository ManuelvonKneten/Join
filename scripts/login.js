// Initialize the login page after the DOM has finished loading.
document.addEventListener('DOMContentLoaded', initLogin);


/**
 * Sets up the login form, guest login button, password toggle, and input checks.
 *
 * @returns {void}
 */
function initLogin() {
    const guestBtn   = document.getElementById('guestLoginBtn');
    const loginForm  = document.querySelector('form');
    const alertBox   = document.querySelector('.wrongDataAlert');
    const emailInput = document.getElementById('loginEmail');
    const passInput  = document.getElementById('loginPassword');
    const passToggle = document.getElementById('loginPasswordToggle');

    guestBtn.addEventListener('click', loginAsGuest);
    loginForm.addEventListener('submit', (e) => handleLogin(e, emailInput, passInput, alertBox));

    initPasswordToggle(passInput, passToggle);
    initBlurCheck(emailInput, passInput, alertBox);
}


/**
 * Logs in without a user account and opens the summary page.
 *
 * @returns {void}
 */
function loginAsGuest() {
    localStorage.setItem('currentUser', 'Guest');
    window.location.href = './htmls/summary.html';
}


/**
 * Searches the stored users for matching login credentials.
 *
 * @param {string} email - The email address entered in the login form.
 * @param {string} password - The password entered in the login form.
 * @returns {Promise<Object|undefined>} The matching user object, or undefined if no user matches.
 */
async function findUser(email, password) {
    const data  = await getFromDB('users');
    const users = data ? Object.values(data) : [];
    return users.find(u => u.email === email && u.password === password);
}


/**
 * Handles the login form submit event and redirects valid users.
 *
 * @param {SubmitEvent} e - The submit event from the login form.
 * @param {HTMLInputElement} emailInput - The email input element.
 * @param {HTMLInputElement} passInput - The password input element.
 * @param {HTMLElement} alertBox - The alert element for wrong login data.
 * @returns {Promise<void>}
 */
async function handleLogin(e, emailInput, passInput, alertBox) {
    e.preventDefault();
    if (!emailInput.value || !passInput.value) {
        alertBox.classList.add('visible');
        return;
    }
    const found = await findUser(emailInput.value, passInput.value);

    if (found) {
        localStorage.setItem('currentUser', found.name || found.email);
        window.location.href = './htmls/summary.html';
    } else {
        alertBox.classList.add('visible');
    }
}


/**
 * Sets up input and blur checks for the login fields.
 *
 * @param {HTMLInputElement} emailInput - The email input element.
 * @param {HTMLInputElement} passInput - The password input element.
 * @param {HTMLElement} alertBox - The alert element for wrong login data.
 * @returns {void}
 */
function initBlurCheck(emailInput, passInput, alertBox) {
    const hideAlert = () => { alertBox.classList.remove('visible'); };
    emailInput.addEventListener('input', hideAlert);
    passInput.addEventListener('input', hideAlert);

    const emailError = document.getElementById('loginEmailError');
    emailInput.addEventListener('blur', () => {
        const invalid = emailInput.value.length > 0 && !emailInput.value.includes('@');
        if (emailError) emailError.classList.toggle('visible', invalid);
    });
    emailInput.addEventListener('input', () => {
        if (emailError) emailError.classList.remove('visible');
    });
}

