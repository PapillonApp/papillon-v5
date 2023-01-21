// Imports
// import { app } from '@/main.ts'
import { Capacitor } from '@capacitor/core';

// Constantes

// Variables
let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';

function checkDarkMode() {
  // vérication du mode sombre depuis le CSS
  isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setStatusBarStyle() {
  if (isDarkMode) {
    // status bar en mode sombre
    StatusBar.setBackgroundColor({color: "#1C1B1F"});
    StatusBar.setStyle({style: Style.Dark})
  }
  else {
    // status bar en mode clair
    StatusBar.setBackgroundColor({color: "#ffffff"});
    StatusBar.setStyle({style: Style.Light})
  }
}

// Navigation bar (Android only)
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

function setNavigationBarStyle() {
  if (isDarkMode) {
    // navigation bar en mode sombre
    NavigationBar.setColor({
        color: "#1C1B1F",
        darkButtons: false
    });
  }
  else {
    // navigation bar en mode clair
    NavigationBar.setColor({
        color: "#ffffff",
        darkButtons: true
    });
  }
}

function setDarkMode() {
  // si nous sommes sur mobile
  if (Capacitor.getPlatform() !== 'web') {
    // vérification du mode sombre
    checkDarkMode();
    // changement du style de la status bar
    setStatusBarStyle();
    // changement du style de la navigation bar (Android only)
    if (Capacitor.getPlatform() === 'android') {
      // changement du style de la navigation bar
      setNavigationBarStyle();
    }
  }
}

// Constantly check for dark mode
setInterval(setDarkMode, 1000);

// première vérification du mode sombre
setDarkMode();