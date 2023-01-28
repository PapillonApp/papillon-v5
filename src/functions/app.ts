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

import { AndroidShortcuts } from 'capacitor-android-shortcuts';
import axios from 'axios';

async function getToBase64(filepath: string) {
  const response = await axios.get(filepath, { responseType: 'blob' });
  const filereader = new FileReader();
  return new Promise((resolve, reject) => {
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
            name: "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAC3klEQVRoBe1aMW4bMRD0E/IEt/mA6yAfiH+Q/CCu09hJl85FKlcp1Tk/UBeXil+gJxDQcXlQdcEIHOOg4512yaMuCGxAGN55Sc7s7ZLLky4uXv/+Aw84597sdrtr7/19COFRRLbeeyciHT6xvQkhrGEDW/RZXHrTNO8iqReyJK1BiIWYswsRkWt4WUNSabNt2/ZjdSHOuUt4XEnqED5G2w3mqCIkhPC5H9dGYhYxLoRwM6sIEbmtSDgprm3b21lELEGezioWsST5YhGIeQ6yNJpzAivBmRI2Gf8JhznT6iQim8Qg2smq2GH5ViW19/7Tv0aefFS7du4O+/bHlw4fTjaGWruR/tvJpwCFIx1nI1YooEP9NSpCRFBJniRLm9Wfp+7q4evB8yRmwfc/v3er5yf1fJh3NBdQ3pKYFkHAQjhle/XwzSRARLAiDUvxnPBJEcq5p3UY7fb7/YdBGDVNc08DLeaQTfXRzkc7HIoGAnLK5BSZnHskZsBfAwHee/PmlUM21cdAnPkyXE6RHNaBSMbaj/YF/d3gCXBQCxYQOHiypH8VASR0Cukk2vHagikBxSFEQqeQRGnHawMmQ8j8lqGAQGkIbVJPwFRGwFtLCUiWEyUbGR89BaWQNn2kXf+epp3cyEpKCU5KQimkTR9p17+naSdLiVjMmRI5lwBJ5vZPFnNICms5kUugUMCwjGBG47DAwTVYchageJTkmrlokwwfCgBajpQ4jJScCeCA1fNvi4BhDdQnj3ZOMtM7tVH9BtuaC7WJx/GHm9ex93ndtu1lTnVaSwhesoET+anQe39Ti5B1XHBRkT42aprmzjpZBfu7Y16m64VFlJGn0oVEzEOeImJOmEqNnHBCwmbHPMmOIVaCnMO/Voj3fm1ebcbITt2Pb7DNB6AJIRjr/N8Xx13bfBCCkBgq68mXtVNenPN/Xde9/NQAYYAw63/DE9vw8iN/aoA+c3J4HWspD/wFfuYnoVr/2gAAAAAOZVhJZk1NACoAAAAIAAAAAAAAANJTkwAAAABJRU5ErkJggg==",
          },
          data: "timetable",
        },
        {
          id: "homework",
          shortLabel: "Devoirs",
          longLabel: "Consulter les devoirs",
          icon: {
            type: "Bitmap",
            name: "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAC/klEQVRoBe2asW4UMRCG8wg8QlpeIDXiBZI3gJaKNDQ0CXRUCRJVqlToqIJooLsKUi6pI+WKKIgUyNKtx9ZVRv9pJ/Ldenc9Xu8tQTlpZWvPa3//eMYe793W1sPnP7CAUurRfD7f01ofG2POiGimtVZE5HBV9cIYM0UbtMUzo0svy/JJBXUHy9AxJcRCzMaFENEerBwDGdlmZq19NrgQpdQ2LB4JtXQfYdsCYwwixBjz0vdrIZhEjDLG7GcVQUQHAwIHxVlrD7KIGAOejdVbxJjwvUXA57mTsUtxTGAl2FDABv0/YDAlWp2IqAh0EjvYIO2wfEcFtdb6+b8GzzxRu3bmHTb3bMxaZwEKWW1MOfl57nZO3rjHH14nXU9P37nJxblIJPKvRhFEhEwyukMApMLzczsnb6PHA1tjLCC9lcCjLUP0LYXjYkWqp+JS9xlRgFssFrs1NyrL8lhoiaQZCMWMdFwcimoCUtJkqescff/qLm9/ufXYkQogos81AVpr8eYlEQB4Bn3x5XRl9vi+oKwvp0QkPhauC1i3LH/vw7/69mkFHm0E4NxW1WYgoZMVkN2P791v9We5rjM4yi74RAEuuwBY//L2ZmkhbE6x8DkFZHEhFlFcX/F0u5DbAJyvhNkPupD4LQMD+KU/EwDrgsezCQKKkAuJ0ggM6oP7dRYRA58iIJhO5N7IQhuWL9KvS2cguJHd+1SiSuZEgexbsU9dOgPBZA5BIU0nJG7SJBDxIhRQTyM4onFYkHSG9R4ATXBd92GAycUPkYBgJsoCUN7rIyUEpASzZNb6tI1+gy2NhT5Qgmfrm5fvOn7dWrudkp0KYER+j5dsYPIZO+ta6/2hgKT9gqUTONSgLMtD6WADtD8MsUXfG1lEP3hWOZKIPPAsoooJUaqR4k4I2GSfZ9imEitByuE/VojWeipebZpg2+5Xb7DFB6AWIehr878XV7u2+CAEIZWrTFtf1rZZMed3zrm7vxrADeBm/i88VR1WPuO/GuCZnAwPfY1lgb8ywLLCPp3LWQAAAA5lWElmTU0AKgAAAAgAAAAAAAAA0lOTAAAAAElFTkSuQmCC"
          },
          data: "homework",
        },
        {
          id: "grades",
          shortLabel: "Notes",
          longLabel: "Consulter les notes",
          icon: {
            type: "Bitmap",
            name: "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAADdElEQVRoBe1avW4UMRDOI/AIafMC1IgXSB4gErRUpKGhSaCjuiBRAKJIhSgiJUKKSJWTolBRbHcUAU4CEZECWbr1eHXVom/ZOTler+Of3VuEctJpdr0e+/vGM+Px3q2s3Hz+AwsIIW7NZrMNKeWuUuqAiKZSSkFEJb71daaUGqMP+kJncOp5nt+pQS3AMmgfCbIgs3QiRLQBK/uA9OwzLYriXu9EhBCrsLgnqMp9AvtmmKMXIkqph7pfBwILISOUUludkiCi7R4BW8kVRbHdCYkhwLOxkkkMCT6ZBHyeBxlaBscEMsGSAtbq/xaDiaDsRESZZRDfyXrph/TtFdRSyvv/GnjG47Vrp+6wo7PjXlagJjF1rgIYMtsYeX75s1x78bg8/TrpjQTqr1YSRIRKMmry0y+TcnP/VUUAEmRix3LptcYCyluXouvZ6OxDBRzW179od+lFPkNGapbi6e5zcWUFTDfCCpltkQTK+Xy+3nCjPM93YwdkPQDECpxfXjQs/+j4XUWQ++oy+/6t0V9/bl7jUNQgEFMm26w6+njVbfTYADkQQRuDOppkFenA7HXYICClDN68XFZlgFgV9OPY2Nx/uXAlBPrt10/+EjCIs36LbKZTIvI+Fl5nVdukyEwgws8A/u7esxjwGEM0VoAH9pEuq7K+7iZogw6+uNbBP3i/tyDFuj4yiQBPYFqV2+HPcBmbX/8Sv8v1t8+r55C4Z70QaSPg7UI8kW5VbmPw7PMmCVgcz+A+tmzF41wjrS6U/JZBB49gNUk8PTnsAjxWLLOtQHQZAWvp4DmVQjIJLjOQdbIfYXnfXA1rOZGykdnA86Q6CZA5+pxF+TyPB2ndyGJLCRd4npRJvPk0TgaPMa2lRF3MBQWyD3gmwSmU71OktZhDUISWE2xZyBRAgbrNMoIjGoeFwMEWm1OoXmx/q/swAcjUI2UsME+9Zg2kg8d1bDB7AkhyNe832KGxsAzw1s3LtD7fF0WxGlKd9k0AL9mAifF5SSnlVt/AfMcHFi/QZqc8z3d8J+mx346JK+h+YBJp4JnpQCS6Ac8k6pgIKjVi3AoBG+3zDLZNIhPEHP59iUgpx8HZpg2sq71+g518ANKIYazl/15c79pRB6HaVcbOl7UuK3b5rCzLxV8N4AZwM/0XnvoaVj7gvxpAp0sMN2MNZYE/p2L8+Qca8QoAAAAOZVhJZk1NACoAAAAIAAAAAAAAANJTkwAAAABJRU5ErkJggg=="
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