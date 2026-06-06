const acceptCheckbox = document.getElementById('signupAccept');
const signupBtn      = document.getElementById('signupBtn');
const signupForm     = document.querySelector('form');
const nameInput      = document.getElementById('signupName');
const emailInput     = document.getElementById('signupEmail');
const passInput      = document.getElementById('signupPassword');
const confirmInput   = document.getElementById('signupConfirmPassword');
const mismatchMsg    = document.getElementById('passwordMismatch');
const urlParams      = new URLSearchParams(window.location.search);
const msgBox         = document.getElementById('msgBox');


function validatePasswords() {
    const match = passInput.value === confirmInput.value;
    confirmInput.setCustomValidity(match ? '' : 'Passwords do not match.');
    mismatchMsg.classList.toggle('visible', !match && confirmInput.value.length > 0);
}

if (confirmInput) {
    confirmInput.addEventListener('input', validatePasswords);
    passInput.addEventListener('input', validatePasswords);
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

if (msgBox && urlParams.get('msg')) {
    msgBox.textContent = urlParams.get('msg');
}


async function addUser() {
    const name     = nameInput.value.trim();
    const email    = emailInput.value.trim();
    const password = passInput.value;

    await postToDB('users', { name, email, password });

    const toast = document.getElementById('signupToast');
    toast.classList.add('show');
    setTimeout(() => {
        window.location.href = '/htmls/login.html?msg=registered';
    }, 2500);
}
