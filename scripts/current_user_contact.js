/**
 * Adds the currently logged-in user to a contact list.
 *
 * The logged-in user's name is stored in localStorage on login, but the account
 * only lives in the "users" database, not in "contacts". This resolves the full
 * user record and marks it as the current user so it can be shown with a "(You)"
 * label. If a contact with the same email already exists, that contact is marked
 * instead (no duplicate is added).
 *
 * @async
 * @param {Contact[]} contacts - The contact list to add the current user to.
 * @returns {Promise<void>}
 */
async function addCurrentUserToContacts(contacts) {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser || currentUser === 'Guest') return;

    const user = await findRegisteredUser(currentUser);
    const name = user?.name || currentUser;
    const email = user?.email || '';

    const existing = email && contacts.find(contact => contact.email === email);
    if (existing) {
        existing.isCurrentUser = true;
        return;
    }

    contacts.push({ id: 'currentUser', name, email, phone: user?.phone || '', isCurrentUser: true });
}


/**
 * Finds the registered user whose stored login identifier matches the given value.
 *
 * On login the current user is stored as `name || email`, so both are compared.
 *
 * @async
 * @param {string} identifier - The value saved in localStorage as `currentUser`.
 * @returns {Promise<{name?: string, email?: string, phone?: string}|undefined>} The matching user record, if any.
 */
async function findRegisteredUser(identifier) {
    const users = await getFromDB('users') || {};
    return Object.values(users).find(user => (user.name || user.email) === identifier);
}
