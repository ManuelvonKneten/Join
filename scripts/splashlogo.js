document.addEventListener('DOMContentLoaded', initSplash);

/**
 * Startet die Splash-Animation, sobald das Header-Logo geladen (und damit
 * messbar) ist. Das Splash-Logo fliegt exakt auf die Position des
 * Header-Logos, damit beim Ausblenden des Overlays kein Sprung entsteht.
 */
function initSplash() {
    const headerLogo = document.querySelector('.logInLogo');
    if (headerLogo && !headerLogo.complete) {
        headerLogo.addEventListener('load', runSplash, { once: true });
    } else {
        runSplash();
    }
}


/**
 * Animiert das Splash-Logo von der Bildschirmmitte bündig auf die
 * Position des Header-Logos und blendet danach das Overlay aus.
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
    ], { duration: 255, easing: 'ease-in-out', fill: 'forwards' });

    anim.onfinish = () => fadeOutSplash(container);
}


/**
 * Ermittelt die exakte Bildposition des Header-Logos (inkl. Innenabstand).
 *
 * @returns {{top: number, left: number}} Zielkoordinaten in Pixeln
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
 * Blendet das Splash-Overlay aus und entfernt es nach der Transition.
 *
 * @param {HTMLElement} container - das Splash-Overlay
 * @returns {void}
 */
function fadeOutSplash(container) {
    container.style.opacity = '0';
    container.addEventListener('transitionend', () => container.remove(), { once: true });
}
