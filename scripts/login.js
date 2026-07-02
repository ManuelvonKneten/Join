document.addEventListener('DOMContentLoaded', initLogin);

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

function loginAsGuest() {
    localStorage.setItem('currentUser', 'Guest');
    window.location.href = './htmls/summary.html';
}

async function findUser(email, password) {
    const data  = await getFromDB('users');
    const users = data ? Object.values(data) : [];
    return users.find(u => u.email === email && u.password === password);
}

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

// Prüft die Eingaben, sobald das Passwortfeld den Fokus verliert (onblur),
// und zeigt darunter den Hinweis, wenn E-Mail/Passwort nicht passen.
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

// Schloss-Icon, solange das Feld leer ist; sobald getippt wird, erscheint das
// Augen-Icon. Ein Klick darauf schaltet die Passwort-Sichtbarkeit um.
function initPasswordToggle(input, toggle) {
    const icons = {
        lock:   './assets/icons/lock.png',
        hidden: './assets/icons/visibility_off.svg',
        shown:  './assets/icons/visibility.svg',
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
