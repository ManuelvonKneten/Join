/**
 * @fileoverview Auth guard — schützt Seiten vor unautorisiertem Zugriff.
 * Muss als erstes Script auf jeder geschützten Seite eingebunden werden.
 * Nutzt den `currentUser`-Eintrag aus dem localStorage, der beim Login
 * (regulär oder Gast) gesetzt wird.
 */

/**
 * Prüft ob ein Benutzer eingeloggt ist.
 * Leitet bei fehlendem `currentUser` sofort zur Login-Seite weiter.
 *
 * @returns {void}
 */
(function guardRoute() {
    if (!localStorage.getItem('currentUser')) {
        window.location.replace('../index.html');
    }
})();
