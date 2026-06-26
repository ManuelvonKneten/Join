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
 * Aktualisiert die Validität des Bestätigungsfeldes (gate für den Submit),
 * ohne die Fehlermeldung anzuzeigen.
 *
 * @returns {boolean} true, wenn beide Passwörter übereinstimmen
 */
function updatePasswordValidity() {
    const match = signupPasswordInput.value === signupConfirmInput.value;
    signupConfirmInput.setCustomValidity(match ? '' : 'Passwords do not match.');
    return match;
}

/**
 * Prüft die Passwörter und zeigt die Fehlermeldung an,
 * wenn sie nicht übereinstimmen (für das blur-Event).
 */
function validatePasswordsOnBlur() {
    const match = updatePasswordValidity();
    mismatchMsg.classList.toggle('visible', !match && signupConfirmInput.value.length > 0);
}

if (signupConfirmInput) {
    // Fehlermeldung erst beim Verlassen des Bestätigungsfeldes anzeigen
    signupConfirmInput.addEventListener('blur', validatePasswordsOnBlur);

    // Beim Tippen nur die Validität aktualisieren und den Fehler ausblenden
    signupConfirmInput.addEventListener('input', () => {
        updatePasswordValidity();
        mismatchMsg.classList.remove('visible');
    });
    signupPasswordInput.addEventListener('input', updatePasswordValidity);
}

initPasswordToggle(signupPasswordInput, document.getElementById('signupPasswordToggle'));
initPasswordToggle(signupConfirmInput, document.getElementById('signupConfirmPasswordToggle'));

/**
 * Zeigt ein Schloss-Icon, solange das Feld leer ist; sobald etwas eingegeben
 * wird, erscheint das Augen-Icon. Ein Klick darauf schaltet die Sichtbarkeit
 * des Passworts um.
 *
 * @param {HTMLInputElement} input - Das Passwort-Eingabefeld
 * @param {HTMLImageElement} toggle - Das zugehörige Icon
 */
function initPasswordToggle(input, toggle) {
    if (!input || !toggle) return;

    const icons = {
        lock:   '/assets/icons/lock.png',
        hidden: '/assets/icons/visibility_off.svg',
        shown:  '/assets/icons/visibility.svg',
    };

    const update = () => {
        if (!input.value) {
            input.type = 'password';
            toggle.src = icons.lock;
            toggle.classList.remove('isToggle');
            return;
        }
        toggle.classList.add('isToggle');
        toggle.src = input.type === 'password' ? icons.hidden : icons.shown;
    };

    input.addEventListener('input', update);
    input.addEventListener('blur', () => { if (!input.value) update(); });
    toggle.addEventListener('click', () => {
        if (!input.value) return;
        input.type = input.type === 'password' ? 'text' : 'password';
        update();
        input.focus();
    });

    update();
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
        window.location.href = '/index.html?msg=registered';
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
