/**
 * Gibt das HTML eines einzelnen Kontakteintrags als String zurück.
 *
 * @function contactItemHTML
 * @param {{ id: string, name: string, email: string, phone: string }} contact - Kontaktobjekt
 * @returns {string} HTML-String des Kontakteintrags
 */
function contactItemHTML(contact) {
    return `
        <div class="contact_item">
            <div class="contact_avatar" style="background-color:${avatarColor(contact.name)}">
                ${initials(contact.name)}
            </div>
            <div class="contact_info">
                <span class="contact_name">${contact.name}</span>
                <span class="contact_email">${contact.email}</span>
            </div>
        </div>
    `;
}
