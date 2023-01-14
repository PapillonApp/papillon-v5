// Imports
// import { app } from '@/main.ts'
import { Capacitor } from '@capacitor/core';

// Constantes

// Variables
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';

function setStatusBarStyle() {
  if (isDarkMode) {
    StatusBar.setBackgroundColor({color: "#1C1B1F"});
    StatusBar.setStyle({style: Style.Dark})
  }
  else {
    StatusBar.setBackgroundColor({color: "#ffffff"});
    StatusBar.setStyle({style: Style.Light})
  }
}

// Navigation bar
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

function setNavigationBarStyle() {
  if (isDarkMode) {
    NavigationBar.setColor({
        color: "#1C1B1F",
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
setTimeout(() => {
  setStatusBarStyle();
  if (Capacitor.getPlatform() === 'android') {
    setNavigationBarStyle();
  }
}, 1000);

// Set status bar and navigation bar style
setStatusBarStyle();
if (Capacitor.getPlatform() === 'android') {
  setNavigationBarStyle();
}
