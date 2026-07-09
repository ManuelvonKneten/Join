/**
 * Starts the splash animation as soon as the header logo is loaded (and thus
 * measurable). The splash logo flies exactly onto the position of the
 * header logo so that no jump occurs when the overlay fades out.
 *
 * @returns {void}
 */
function initSplash() {
    initSplashLogo();
}


/**
 * Initializes the splash logo animation.
 *
 * @returns {void}
 */
function initSplashLogo() {
    initSplashLogoEventListeners();
}


/**
 * Initializes all splash logo event listeners.
 *
 * @returns {void}
 */
function initSplashLogoEventListeners() {
    const headerLogo = document.querySelector('.logInLogo');
    if (headerLogo && !headerLogo.complete) {
        headerLogo.addEventListener('load', runSplash, { once: true });
    } else {
        runSplash();
    }
}


/**
 * Animates the splash logo from the center of the screen flush onto the
 * position of the header logo and then fades out the overlay.
 *
 * @returns {void}
 */
function runSplash() {
    const container = document.getElementById('splashLogoContainer');
    const logo = document.getElementById('splashLogo');
    if (!container || !logo) return;

    const target = getHeaderLogoPosition();

    const anim = logo.animate([
        { top: '50%', left: '50%', transform: 'translate(-50%, -50%) scale(2)' },
        { top: `${target.top}px`, left: `${target.left}px`, transform: 'translate(0, 0) scale(1)' }
    ], { duration: 700, easing: 'ease-in-out', fill: 'forwards' });

    anim.onfinish = () => fadeOutSplash(container);
}


/**
 * Determines the exact image position of the header logo (including padding).
 *
 * @returns {{top: number, left: number}} Target coordinates in pixels
 */
function getHeaderLogoPosition() {
    const headerLogo = document.querySelector('.logInLogo');
    if (!headerLogo) return { top: 88, left: 64 };

    const rect = headerLogo.getBoundingClientRect();
    const style = getComputedStyle(headerLogo);
    return {
        top: rect.top + (parseFloat(style.paddingTop) || 0),
        left: rect.left + (parseFloat(style.paddingLeft) || 0)
    };
}


/**
 * Fades out the splash overlay and removes it after the transition.
 *
 * @param {HTMLElement} container - the splash overlay
 * @returns {void}
 */
function fadeOutSplash(container) {
    container.style.opacity = '0';
    container.addEventListener('transitionend', () => container.remove(), { once: true });
}


/**
 * Registers the DOMContentLoaded listener that starts the splash animation.
 *
 * @returns {void}
 */
function initSplashOnLoad() {
    window.addEventListener('DOMContentLoaded', initSplash);
}

initSplashOnLoad();
