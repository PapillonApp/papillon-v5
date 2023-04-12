// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';
import {ApiUrl, ApiVersion, Kdecole} from "kdecole-api";
import displayToast from "@/functions/utils/displayToast";

// main function
async function getContents(forceReload) {
    switch (localStorage.loginService) {
        case "pronote":
            // return pronote contents
            return getPronoteContents(forceReload);
        case "ecoledirecte":
            return;
        case 'skolengo':
            return getSkolengoContents(forceReload)
    }
}

function getSkolengoContents(forceReload) {
    const token = localStorage.getItem('token');
    const ent = localStorage.getItem('ent');
    const etudiant = new Kdecole(token, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])

    let contentsCache = localStorage.getItem('ContentsCache');
    if (contentsCache != null && !forceReload) {
        contentsCache = JSON.parse(contentsCache);

        let today = new Date();
        let cacheDate = new Date(contentsCache.date);

        if (today.toDateString() == cacheDate.toDateString()) {
            return new Promise((resolve) => {
                resolve(constructSkolengoContents(contentsCache.contents));
            });
        }
    }

    return etudiant.getActualites().then(actu => {
        const today = new Date();
        const contentsCache = {
            date: today,
            contents: actu
        }
        localStorage.setItem('ContentsCache', JSON.stringify(contentsCache));

        return new Promise((resolve) => {
            resolve(constructSkolengoContents(actu));
        });
    }).catch((error) => {
        displayToast.presentError(`${error.message}`, "danger", error)
        console.error(error);
    })

}

function constructSkolengoContents(contents) {
    return contents.map((item) => ({
        title: item.titre,
        content: item.titre,
        htmlContent: 'Rendez vous votre ENT pour consulter le détail de cet article.',
        date: new Date(item.date),
        dateString: new Date(item.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        }) + " à " + new Date(item.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}),
        category: item.type,
        author: item.auteur,
        attachments: [],
        isSurvey: false,
        isRead: true,
        isAnonymized: false,
    })).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
}

// pronote : get timetable
function getPronoteContents(forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // get 1st september of last year
    let date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    date.setMonth(8);
    date.setDate(1);

    const dayString = date.toISOString().split('T')[0];

    // get 1st september of next year
    date.setFullYear(date.getFullYear() + 2);
    date.setMonth(8);
    date.setDate(1);

    const dayString2 = date.toISOString().split('T')[0];

    // construct url (date is a TEST date)
    let URL = `${API}/content?dateString=${dayString}&dateStringEnd=${dayString2}&token=${token}`;

    // send request
    return axios.get(URL)
        .then((response) => {
            console.log(response);

            if(response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            console.log(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
}

// pronote : construct timetable
function constructPronoteContents(contents) {
    return false;
}

// export
export default getContents
