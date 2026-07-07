const DB_URL = 'https://join-project-e7af3-default-rtdb.europe-west1.firebasedatabase.app';

/**
 * Reads data from the Firebase Realtime Database.
 *
 * @async
 * @param {string} path - Firebase path, e.g. "contacts" or "users"
 * @returns {Promise<Object|null>} Read data or null when empty
 * @throws {Error} On a failed request
 */
async function getFromDB(path) {
    const res = await fetch(`${DB_URL}/${path}.json`);
    if (!res.ok) throw new Error('Firebase GET failed');
    return res.json();
}

/**
 * Creates a new entry in the Firebase Realtime Database.
 * Firebase automatically generates a unique ID.
 *
 * @async
 * @param {string} path - Firebase path, e.g. "contacts"
 * @param {Object} data - Data to store
 * @returns {Promise<{ name: string }>} Firebase response object with the generated ID under `.name`
 * @throws {Error} On a failed request
 */
async function postToDB(path, data) {
    const res = await fetch(`${DB_URL}/${path}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Firebase POST failed');
    return res.json();
}

/**
 * Updates individual fields of an existing entry in the Firebase Realtime Database.
 * Fields that are not passed remain unchanged.
 *
 * @async
 * @param {string} path - Firebase path including ID, e.g. "contacts/abc123"
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} Updated record
 * @throws {Error} On a failed request
 */
async function patchToDB(path, data) {
    const res = await fetch(`${DB_URL}/${path}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Firebase PATCH failed');
    return res.json();
}

/**
 * Deletes an entry from the Firebase Realtime Database.
 *
 * @async
 * @param {string} path - Firebase path including ID, e.g. "contacts/abc123"
 * @returns {Promise<void>}
 * @throws {Error} On a failed request
 */
async function deleteFromDB(path) {
    const res = await fetch(`${DB_URL}/${path}.json`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Firebase DELETE failed');
}
