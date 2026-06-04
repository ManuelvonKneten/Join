const DB_URL         = 'https://join-project-e7af3-default-rtdb.europe-west1.firebasedatabase.app';
const acceptCheckbox = document.getElementById('signupAccept');
const signupBtn      = document.getElementById('signupBtn');
const signupForm     = document.querySelector('form');
const emailInput     = document.getElementById('signupEmail');
const passInput      = document.getElementById('signupPassword');
const urlParams      = new URLSearchParams(window.location.search);
const msgBox         = document.getElementById('msgBox');


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

if (msgBox && urlParams.get('msg')) {
    msgBox.innerHTML = urlParams.get('msg');
}


async function addUser() {
    const email    = emailInput.value;
    const password = passInput.value;

    await fetch(`${DB_URL}/users.json`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });

    window.location.href = '/htmls/login.html?msg=Du hast dich erfolgreich registriert';
}
