// Imports
// import { app } from '@/main.ts'

// Constantes

// Variables
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';
StatusBar.setOverlaysWebView({ overlay: true });

function setStatusBarStyle() {
  if (isDarkMode) {
    StatusBar.setStyle({style: Style.Dark});
    StatusBar.setBackgroundColor({color: "#12121200"});
  }
  else {
    StatusBar.setStyle({style: Style.Light});
    StatusBar.setBackgroundColor({color: "#ffffff00"});
  }
}

// Navigation bar
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

function setNavigationBarStyle() {
  if (isDarkMode) {
    NavigationBar.setColor({
        color: "#121212",
        darkButtons: false
    });
  }
  else {
    NavigationBar.setColor({
        color: "#ffffff",
        darkButtons: true
    });
  }
}

// Constantly check for dark mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    setStatusBarStyle();
    setNavigationBarStyle();
});

// Set status bar and navigation bar style
setStatusBarStyle();
setNavigationBarStyle();