// service worker registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js');
}

// prompt to install the app
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
});