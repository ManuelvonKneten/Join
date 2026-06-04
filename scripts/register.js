const acceptCheckbox = document.getElementById('signupAccept');
if (acceptCheckbox) {
    acceptCheckbox.addEventListener('change', function () {
        document.getElementById('signupBtn').disabled = !this.checked;
    });
}


const signupForm = document.querySelector('form');
if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        addUser();
    });
}

// in firebase auslagern!!
let users = [
    { email: 'manuel@test.de',   password: 'test123' },
    { email: 'anna@test.de',     password: 'anna456' },
    { email: 'tom@test.de',      password: 'tom789' },
    { email: 'lisa@test.de',     password: 'lisa321' },
    { email: 'max@test.de',      password: 'max654' },
    { email: 'sara@test.de',     password: 'sara987' },
    { email: 'paul@test.de',     password: 'paul111' },
    { email: 'julia@test.de',    password: 'julia222' },
    { email: 'felix@test.de',    password: 'felix333' },
    { email: 'laura@test.de',    password: 'laura444' },
    { email: 'markus@test.de',   password: 'markus555' },
];


function addUser() {
    const email    = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    users.push({ email, password });
    window.location.href = '/htmls/login.html?msg=Du hast dich erfolgreich registriert';
}


const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get('msg');
const msgBox = document.getElementById('msgBox');
if (msg && msgBox) {
    msgBox.innerHTML = msg;
}
