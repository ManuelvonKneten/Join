document.getElementById('guestLoginBtn').addEventListener('click', () => {
    window.location.href = '/htmls/summary.html';
});


document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const alert    = document.querySelector('.wrongDataAlert');

    const found = users.find(u => u.email === email && u.password === password);

    if (found) {
        window.location.href = '/htmls/summary.html';
    } else {
        alert.style.display = 'block';
    }
});
