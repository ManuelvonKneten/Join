/* ── Password visibility toggle (shared by login and signup) ── */
/**
 * Icon paths for the password toggle, resolved relative to the current page.
 * Pages inside /htmls/ need '../assets', the root index.html needs './assets'.
 *
 * @type {{ lock: string, hidden: string, shown: string }}
 */
const PASSWORD_TOGGLE_ICONS = (() => {
    const base = location.pathname.includes('/htmls/') ? '../assets' : './assets';
    return {
        lock:   `${base}/icons/lock.png`,
        hidden: `${base}/icons/visibility_off.svg`,
        shown:  `${base}/icons/visibility.svg`,
    };
})();


/**
 * Updates the password toggle icon and input type according to the input value.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The toggle icon element.
 * @returns {void}
 */
function updatePasswordToggleIcon(input, toggle) {
    if (!input.value) {
        input.type = 'password';
        toggle.src = PASSWORD_TOGGLE_ICONS.lock;
        toggle.classList.remove('isToggle');
        return;
    }
    toggle.classList.add('isToggle');
    toggle.src = input.type === 'password' ? PASSWORD_TOGGLE_ICONS.hidden : PASSWORD_TOGGLE_ICONS.shown;
}


/**
 * Toggles the password input visibility when the icon is clicked.
 *
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLImageElement} toggle - The toggle icon element.
 * @returns {void}
 */
function handlePasswordToggleClick(input, toggle) {
    if (!input.value) return;
    input.type = input.type === 'password' ? 'text' : 'password';
    updatePasswordToggleIcon(input, toggle);
    input.focus();
}


/**
 * Initializes the password visibility toggle for a password input.
 *
 * @param {HTMLInputElement|null} input - The password input element.
 * @param {HTMLImageElement|null} toggle - The toggle icon element.
 * @returns {void}
 */
function initPasswordToggle(input, toggle) {
    if (!input || !toggle) return;
    input.addEventListener('input', () => updatePasswordToggleIcon(input, toggle));
    input.addEventListener('blur', () => { if (!input.value) updatePasswordToggleIcon(input, toggle); });
    toggle.addEventListener('click', () => handlePasswordToggleClick(input, toggle));
    updatePasswordToggleIcon(input, toggle);
}
