// Imports
// import { app } from '@/main.ts'
import { Capacitor } from '@capacitor/core';

// Variables
let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
let colorForced = localStorage.getItem('colorForced') === 'true';

// Status bar
import { StatusBar, Style } from '@capacitor/status-bar';

function checkDarkMode() {
	isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
	colorForced = localStorage.getItem('colorForced') === 'true';
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

function updateStatus() {
	if (Capacitor.getPlatform() !== 'web') {
		checkDarkMode();
		setStatusBarStyle();
		if (Capacitor.getPlatform() === 'android') {
			setNavigationBarStyle();
		}
	}
}

// Constantly check for dark mode
updateStatus();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateStatus);

import { AndroidShortcuts } from 'capacitor-android-shortcuts';
import axios from 'axios';

async function getToBase64(filepath: string) {
	const response = await axios.get(filepath, { responseType: 'blob' });
	const filereader = new FileReader();
	return new Promise((resolve) => {
		filereader.onloadend = () => {
			const result = filereader.result;
			resolve(result);
		};
		filereader.readAsDataURL(response.data);
	})
}

AndroidShortcuts.isDynamicSupported().then((result) => {
	if (result) {
		AndroidShortcuts.addDynamic({
			items: [
				{
					id: "timetable",
					shortLabel: "Emploi du temps",
					longLabel: "Consulter l'emploi du temps",
					icon: {
						type: "Bitmap",
						name: "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",
					},
					data: "timetable",
				},
				{
					id: "homework",
					shortLabel: "Devoirs",
					longLabel: "Consulter les devoirs",
					icon: {
						type: "Bitmap",
						name: "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"
					},
					data: "homework",
				},
				{
					id: "grades",
					shortLabel: "Notes",
					longLabel: "Consulter les notes",
					icon: {
						type: "Bitmap",
						name: "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"
					},
					data: "grades",
				},
			],
		}).catch((err) => {
			console.error("[Android Shortcuts]: " + err);
		});
	}
});

// save logs to localstorage
// console.log, console.warn, console.error, console.info, console.debug


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
	if (logs.length > 250) {
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