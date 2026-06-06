const guestBtn    = document.getElementById('guestLoginBtn');
const loginForm   = document.querySelector('form');
const alertBox    = document.querySelector('.wrongDataAlert');
const emailInput  = document.getElementById('loginEmail');
const passInput   = document.getElementById('loginPassword');


guestBtn.addEventListener('click', () => {
    localStorage.setItem('currentUser', 'Guest');
    window.location.href = '/htmls/summary.html';
});


loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = emailInput.value;
    const password = passInput.value;
    const data  = await getFromDB('users');
    const users = data ? Object.values(data) : [];
    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
        localStorage.setItem('currentUser', found.name || found.email);
        window.location.href = '/htmls/summary.html';
    } else {
        alertBox.style.display = 'block';
    }
});
