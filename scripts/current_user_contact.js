/**
 * Adds the currently logged-in user to a contact list.
 *
 * The logged-in user's name is stored in localStorage on login, but the account
 * only lives in the "users" database, not in "contacts". This resolves the full
 * user record and marks it as the current user so it can be shown with a "(You)"
 * label. If a contact with the same email (or name) already exists, that contact
 * is marked instead (no duplicate is added). Otherwise the user is persisted as a
 * real contact in the database so its Firebase ID can be referenced by task
 * assignments and resolved by every other user, not just the current session.
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
    const phone = user?.phone || '';

    const existing = contacts.find(contact =>
        (email && contact.email === email) || contact.name === name);
    if (existing) {
        existing.isCurrentUser = true;
        return;
    }

    await createCurrentUserContact(contacts, { name, email, phone });
}


/**
 * Persists the current user as a real contact in the database and appends the
 * created contact (with its generated Firebase ID) to the given list. On failure
 * the list is left unchanged and the error is logged.
 *
 * @async
 * @param {Contact[]} contacts - The contact list to append the created contact to.
 * @param {{name: string, email: string, phone: string}} data - Contact fields to store.
 * @returns {Promise<void>}
 */
async function createCurrentUserContact(contacts, data) {
    try {
        const { name: id } = await postToDB('contacts', data);
        contacts.push({ id, ...data, isCurrentUser: true });
    } catch (error) {
        console.error('Current user could not be added to contacts:', error);
    }
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
