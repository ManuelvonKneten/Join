/**
 * @fileoverview Auth guard — protects pages from unauthorized access.
 * Must be included as the first script on every protected page.
 * Uses the `currentUser` entry from localStorage, which is set on login
 * (regular or guest).
 */


/**
 * Checks whether a user is logged in.
 * Redirects immediately to the login page when `currentUser` is missing.
 *
 * @returns {void}
 */
function guardRoute() {
    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
        window.location.replace('../index.html');
    }
}

guardRoute();
