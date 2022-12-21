// Imports
// import { app } from '@/main.ts'
import { Capacitor } from '@capacitor/core';

// Constantes

// Variables
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';

function setStatusBarStyle() {
  StatusBar.setStyle({style: Style.Default})

  if (isDarkMode) {
    StatusBar.setBackgroundColor({color: "#181B1C"});
  }
  else {
    StatusBar.setBackgroundColor({color: "#ffffff"});
  }
}

// Navigation bar
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

function setNavigationBarStyle() {
  if (isDarkMode) {
    NavigationBar.setColor({
        color: "#131516",
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

if (Capacitor.isNativePlatform()) {
  // Constantly check for dark mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setStatusBarStyle();
      setNavigationBarStyle();
  });

  // Set status bar and navigation bar style
  setStatusBarStyle();
  setNavigationBarStyle();
}