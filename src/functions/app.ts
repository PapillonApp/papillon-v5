// Imports
// import { app } from '@/main.ts'
import { Capacitor } from '@capacitor/core';

// Variables
let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';

function checkDarkMode() {
  isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

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
setInterval(() => {
  if (Capacitor.getPlatform() !== 'web') {
    checkDarkMode();
    setStatusBarStyle();
    if (Capacitor.getPlatform() === 'android') {
      setNavigationBarStyle();
    }
  }
}, 1000);

// Set status bar and navigation bar style
if (Capacitor.getPlatform() !== 'web') {
  checkDarkMode();
  setStatusBarStyle();
  if (Capacitor.getPlatform() === 'android') {
    setNavigationBarStyle();
  }
}

// save logs to localstorage
// console.log, console.warn, console.error


// don't affect console.log, console.warn, console.error


function saveInLocalStorage(content :string, type: string){
  // save to localstorage
  // save to array in localstorage ({date, type, message})
  // max 1000 logs
  const logs = JSON.parse(localStorage.getItem('logs')||"[]");
  
  // style the content to be more readable 
  if (typeof content === 'object') {
    content = JSON.stringify(content, null, 2);
  }

  logs.push({date: new Date, type: type, message: content});
  if (logs.length > 1000) {
    logs.shift();
  }
  localStorage.setItem('logs', JSON.stringify(logs));
}

const consoleLog = console.log;
const consoleWarn = console.warn;
const consoleError = console.error;
const consoleInfo = console.info;
const consoleDebug = console.debug;

console.log = function(content :string){
  consoleLog(content);
  saveInLocalStorage(content, 'log');
}

console.warn = function(content :string){
  consoleWarn(content);
  saveInLocalStorage(content, 'warn');
}

console.error = function(content :string){
  consoleError(content);
  saveInLocalStorage(content, 'error');
}

console.info = function(content :string){
  consoleInfo(content);
  saveInLocalStorage(content, 'info');
}

console.debug = function(content :string){
  consoleDebug(content);
  saveInLocalStorage(content, 'debug');
}