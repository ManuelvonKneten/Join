const acceptCheckbox = document.getElementById('signupAccept');
const signupBtn      = document.getElementById('signupBtn');
const signupForm     = document.querySelector('form');
const signupNameInput      = document.getElementById('signupName');
const signupEmailInput     = document.getElementById('signupEmail');
const signupPasswordInput      = document.getElementById('signupPassword');
const signupConfirmInput   = document.getElementById('signupConfirmPassword');
const mismatchMsg    = document.getElementById('passwordMismatch');
const urlParams      = new URLSearchParams(window.location.search);
const messageBox     = document.getElementById('msgBox');


/**
 * Prüft ob Passwort und Bestätigungsfeld übereinstimmen.
 * Zeigt eine Fehlermeldung an, wenn sie es nicht tun.
 */
function validatePasswords() {
    const match = signupPasswordInput.value === signupConfirmInput.value;
    signupConfirmInput.setCustomValidity(match ? '' : 'Passwords do not match.');
    mismatchMsg.classList.toggle('visible', !match && signupConfirmInput.value.length > 0);
}

if (signupConfirmInput) {
    signupConfirmInput.addEventListener('input', validatePasswords);
    signupPasswordInput.addEventListener('input', validatePasswords);
}

if (acceptCheckbox) {
    acceptCheckbox.addEventListener('change', function () {
        signupBtn.disabled = !this.checked;
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addUser();
    });
}

if (messageBox && urlParams.get('msg')) {
    messageBox.textContent = urlParams.get('msg');
}


/**
 * Liest das Formular aus, speichert den neuen User in Firebase
 * und leitet bei Erfolg zur Login-Seite weiter.
 *
 * @async
 * @returns {Promise<void>}
 */
async function addUser() {
    const formData = getRegisterFormData();

    try {
        await postToDB('users', formData);
        onUserRegistered();
    } catch {
        showRegisterError('Registration failed. Please try again.');
    }
}

/**
 * Liest Name, Email und Passwort aus dem Registrierungsformular.
 *
 * @returns {{ name: string, email: string, password: string }}
 */
function getRegisterFormData() {
    return {
        name:     signupNameInput.value.trim(),
        email:    signupEmailInput.value.trim(),
        password: signupPasswordInput.value
    };
}

/**
 * Zeigt den Erfolgs-Toast an und leitet nach 2,5 Sekunden zur Login-Seite weiter.
 */
function onUserRegistered() {
    const signupToast = document.getElementById('signupToast');
    signupToast.classList.add('show');
    setTimeout(() => {
        window.location.href = '/htmls/login.html?msg=registered';
    }, 2500);
}

/**
 * Zeigt eine Fehler-Toast-Nachricht für 3 Sekunden an.
 *
 * @param {string} message - Anzuzeigende Fehlermeldung
 */
function showRegisterError(message) {
    const signupToast = document.getElementById('signupToast');
    signupToast.textContent = message;
    signupToast.classList.add('show', 'toast_error');
    setTimeout(() => signupToast.classList.remove('show', 'toast_error'), 3000);
}
