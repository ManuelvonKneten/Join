const DB_URL = 'https://join-project-e7af3-default-rtdb.europe-west1.firebasedatabase.app';

/**
 * Liest Daten aus der Firebase Realtime Database.
 *
 * @async
 * @param {string} path - Firebase-Pfad, z.B. "contacts" oder "users"
 * @returns {Promise<Object|null>} Gelesene Daten oder null wenn leer
 * @throws {Error} Bei fehlgeschlagenem Request
 */
async function getFromDB(path) {
    const res = await fetch(`${DB_URL}/${path}.json`);
    if (!res.ok) throw new Error('Firebase GET failed');
    return res.json();
}

/**
 * Erstellt einen neuen Eintrag in der Firebase Realtime Database.
 * Firebase generiert dabei automatisch eine eindeutige ID.
 *
 * @async
 * @param {string} path - Firebase-Pfad, z.B. "contacts"
 * @param {Object} data - Zu speichernde Daten
 * @returns {Promise<{ name: string }>} Firebase-Antwortobjekt mit generierter ID unter `.name`
 * @throws {Error} Bei fehlgeschlagenem Request
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
 * Aktualisiert einzelne Felder eines bestehenden Eintrags in der Firebase Realtime Database.
 * Nicht übergebene Felder bleiben unverändert.
 *
 * @async
 * @param {string} path - Firebase-Pfad inkl. ID, z.B. "contacts/abc123"
 * @param {Object} data - Zu aktualisierende Felder
 * @returns {Promise<Object>} Aktualisierter Datensatz
 * @throws {Error} Bei fehlgeschlagenem Request
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
 * Löscht einen Eintrag aus der Firebase Realtime Database.
 *
 * @async
 * @param {string} path - Firebase-Pfad inkl. ID, z.B. "contacts/abc123"
 * @returns {Promise<void>}
 * @throws {Error} Bei fehlgeschlagenem Request
 */
async function deleteFromDB(path) {
    const res = await fetch(`${DB_URL}/${path}.json`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Firebase DELETE failed');
}
