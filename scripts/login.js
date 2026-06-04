const DB_URL      = 'https://join-project-e7af3-default-rtdb.europe-west1.firebasedatabase.app';
const guestBtn    = document.getElementById('guestLoginBtn');
const loginForm   = document.querySelector('form');
const alertBox    = document.querySelector('.wrongDataAlert');
const emailInput  = document.getElementById('loginEmail');
const passInput   = document.getElementById('loginPassword');


guestBtn.addEventListener('click', () => {
    window.location.href = '/htmls/summary.html';
});


loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = emailInput.value;
    const password = passInput.value;
    const res   = await fetch(`${DB_URL}/users.json`);
    const data  = await res.json();
    const users = data ? Object.values(data) : [];
    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
        window.location.href = '/htmls/summary.html';
    } else {
        alertBox.style.display = 'block';
    }
});
