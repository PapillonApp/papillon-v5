// modules
import axios from 'axios';
import * as moment from "moment";

// vars
import {app} from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import subjectColor from '@/functions/utils/subjectColor.js'
import {ApiUrl, ApiVersion, Kdecole} from "kdecole-api";
import displayToast from "@/functions/utils/displayToast";

// main function
async function getHomeworks(dateFrom, dateTo, forceReload) {
    switch (localStorage.loginService) {
        case "pronote":
            // return pronote homework
            return getPronoteHomework(dateFrom, dateTo, forceReload);
        case "ecoledirecte":
            return getEDHomework(dateFrom, dateTo, forceReload)
        case 'skolengo':
            return getSkolengoHomeWork(dateFrom, dateTo, forceReload)
    }
}

async function getSkolengoHomeWork(dateFrom, dateTo, forceReload) {

    const dayString = new Date(dateFrom).toISOString().split('T')[0]
    let cacheSearch = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.dateFrom === dayString;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached homework in promise
        return new Promise((resolve) => {
            let homework = JSON.parse(cacheSearch[0].homework);
            resolve(constructSkolengoHomework(homework));
        });
    } else {
        try {
            const token = localStorage.getItem('token');
            const ent = localStorage.getItem('ent');
            const etudiant = new Kdecole(token, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])

            console.log("[REQUEST] [HOMEWORK] Requesting homeworks...")
            const taf = await etudiant.getTravailAFaire(undefined, new Date(dateFrom))
            if (!taf.tafOuvert) throw new Error("Service TAF fermé")

            const homeworks = (
                await Promise.all(
                    taf.listeTravaux.map(jour => jour.listTravail).flat()
                        .map(travail => etudiant.getContenuActivite(travail.uidSeance, travail.uid).catch(console.error))
                )).filter(t => t !== undefined)

            if (!homeworks.length) throw new Error("Aucun travail à faire n'a été trouvé.")

            const all_homeworks = constructSkolengoHomework(homeworks)

            let cache = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
            let cacheElement = {
                dateFrom: dayString,
                token: token,
                homework: JSON.stringify(homeworks)
            };
            cache.push(cacheElement);
            localStorage.setItem('HomeworkCache', JSON.stringify(cache));

            return all_homeworks
        } catch (e) {
            displayToast.presentError(`${e.message}`, "danger", e)
            console.error(e);
        }
    }
}

function constructSkolengoHomework(homework) {
    return homework.map(travail => ({
        data: {
            id: travail.uid,
            date: travail.date,
            color: subjectColor.getSubjectColor(travail.matiere),
            done: travail.flagRealise,
        },
        homework: {
            subject: travail.matiere,
            content: travail.codeHTML.replace(/style=/g, 'nostyle='),
            shortContent: travail.type,
        },
        files: travail.pjs.map(pj => ({name: pj.name, url: pj.url})),
    }))
}

// pronote : get homework
function getPronoteHomework(dateFrom, dateTo, forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const dayRequest = new Date(dateFrom);
    const dayRequestTo = new Date(dateTo);

    // get token
    const token = localStorage.getItem('token');

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];
    const dayStringTo = dayRequestTo.toISOString().split('T')[0];

    // construct url (date is a TEST date)
    let URL = `${API}/homework?dateFrom=${dayString}&dateTo=${dayStringTo}&token=${token}`;

    // check if homework is cached
    let cacheSearch = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.dateFrom == dayString && element.dateTo == dayStringTo;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached homework in promise
        return new Promise((resolve) => {
            let homework = JSON.parse(cacheSearch[0].homework);
            resolve(constructPronoteHomework(homework, dateFrom));
        });
    } else {
        // get homework from API
        return axios.get(URL)
            .then((response) => {
                // get homework
                let homeworks = response.data;

                // construct homework
                homeworks = constructPronoteHomework(homeworks, dateFrom);

                // cache response
                let cache = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
                let cacheElement = {
                    dateFrom: dayString,
                    dateTo: dayStringTo,
                    token: token,
                    homework: JSON.stringify(response.data)
                };
                // Remove old cache
                cache = cache.filter((element) => {
                    return element.dateFrom != dayString && element.dateTo != dayStringTo;
                });
                // Add new cache
                cache.push(cacheElement);
                localStorage.setItem('HomeworkCache', JSON.stringify(cache));

                // return homeworks
                return homeworks;
            })
            .catch((error) => {
                if (error.response) {
                    // check if "notfound" or "expired"
                    if (error.response.data == "notfound") {
                        // get new token
                        GetToken();
                    } else if (error.response.data == "expired") {
                        // get new token
                        GetToken();
                    }
                }

                if (error.code) {
                    // return error code
                    return error.code;
                }
            });
    }
}

// pronote : construct homework
function constructPronoteHomework(hw, dateFrom) {
    // declaring vars
    let homeworkArray = [];

    // for each course in homework
    hw.forEach((homework) => {
        // for each file in homework.files
        homework.files.forEach((file) => {
            // if no file.name, set it to "Document"
            if (!file.name) {
                file.name = "Document";
            }

            // if file.url is not a link
            if (!file.url.startsWith("http")) {
                // remove file
                homework.files.splice(homework.files.indexOf(file), 1);
            }
        });

        // get homework description
        let homeworkDescription = homework.description;
        // limit to 50 chars but let it end on a word
        if (homeworkDescription.length > 80) {
            homeworkDescription = homeworkDescription.substring(0, 80);
            homeworkDescription = homeworkDescription.substring(0, homeworkDescription.lastIndexOf(" "));
            homeworkDescription += "...";
        }

        // replace new lines in homework.description with <br/>
        homework.description = homework.description.replace(/\n/g, "<br/>");

        // parse links in homework.description
        homework.description = homework.description.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        // construct course
        let newHomework = {
            data: {
                id: homework.id,
                date: homework.date.replace(/-/g, "/"),
                color: subjectColor.getSubjectColor(homework.subject.name, homework.background_color),
                done: homework.done,
            },
            homework: {
                subject: homework.subject.name,
                content: homework.description,
                shortContent: homeworkDescription,
            },
            files: homework.files,
        };

        subjectColor.setSubjectColor(newHomework.homework.subject, newHomework.data.color, true);

        // push course to courses
        homeworkArray.push(newHomework);
    });

    // add custom homework
    let customHomework = JSON.parse(localStorage.getItem('customHomeworks')) || [];

    customHomework.forEach((homework) => {
        let homeworkDate = new Date(homework.date);
        homeworkDate.setHours(0, 0, 0, 0);

        let searchDate = new Date(dateFrom);
        searchDate.setHours(0, 0, 0, 0);

        // check if homework is in date range
        if (homeworkDate.getDate() == searchDate.getDate()) {
            // construct homework
            homeworkArray.push(homework.homework);
        }
    });

    // return courses
    return homeworkArray;
}


// ed : get homework
function getEDHomework(dateFrom, dateTo, forceReload) {
    // gather vars
    const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;
    const dayRequest = new moment(dateFrom);
    const dayRequestTo = new moment(dateTo);

    let newDayRequest = dayRequest.format("YYYY-MM-DD").replace("/", "-").replace("/", "-").replace("/", "-")

    // get token
    const token = localStorage.getItem('token');
    const userID = JSON.parse(localStorage.UserCache).id;

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];
    const dayStringTo = dayRequestTo.toISOString().split('T')[0];

    // construct url (date is a TEST date)
    let URL = `${EDAPI}/Eleves/${userID}/cahierdetexte.awp?verbe=get`;
    // check if homework is cached
    let cacheSearch = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.dateFrom == dayString && element.dateTo == dayStringTo;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached homework in promise
        return new Promise((resolve) => {
            let homework = JSON.parse(cacheSearch[0].homework);
            resolve(constructEDHomework(homework));
        });
    } else {
        // get homework from API

        var requestOptions = {
            headers: {"Content-Type": "application/x-www-form-urlencoded", "X-Token": token},
        };
        let body = `data={}`

        console.log("[REQUEST] [HOMEWORK] Requesting homeworks...")

        return axios.post(URL, body, requestOptions)
            .then(async (response) => {
                if (response.data.code != 200) {
                    if (response.data.code === 525) {
                        // get new token
                        GetToken();
                    } else if(response.data.code === 520) {
                        GetToken();
                    }
                    else {
                        return new Promise((reject) => {
                            reject({
                                error: response.data.code
                            });
                        });
                    }
                }

                // get homework
                let homeworksdate = response.data.data;

                var all_homeworks = [];

                console.log("[REQUEST] [HOMEWORK] Requesting content homeworks...")

                async function requestContent() {
                    return new Promise((resolve) => {
                        Object.keys(homeworksdate).forEach(async date => {

                            let URL2 = `${EDAPI}/Eleves/${userID}/cahierdetexte/${date}.awp?verbe=get`;
        
                            await axios.post(URL2, body, requestOptions).then(response2 => {
                                if (response.data.data.code) {
                                    if (response.data.data.code == 525) {
                                        // get new token
                                        GetToken();
                                    }
                                    else {
                                        return new Promise((reject) => {
                                            reject({
                                                error: response.data.data.code
                                            });
                                        });
                                    }
                                }
        
                                let homework = response2.data.data;
                                all_homeworks[date] = homework.matieres;
                                console.log(`[${date}] ${JSON.stringify(homework.matieres)}`)
        
                                resolve(all_homeworks)
                            })
                        })
                    })
                }
                all_homeworks = await requestContent()
                // construct homework
                all_homeworks = constructEDHomework(all_homeworks);


                // cache response
                let cache = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
                let cacheElement = {
                    dateFrom: dayString,
                    dateTo: dayStringTo,
                    newDayRequest: newDayRequest,
                    token: token,
                    homework: JSON.stringify(all_homeworks)
                };
                cache.push(cacheElement);
                localStorage.setItem('HomeworkCache', JSON.stringify(cache));

                // return homeworks
                return all_homeworks;
            })
    }
}

// ed : construct homework
function constructEDHomework(hw) {

    console.log("Building homeworks...")
    // declaring vars
    let homeworkArray = [];
    
    /*
    ===============================================
    UNUSED VARIABLES | PLEASE UNCOMMENT WHEN NEEDED
    ===============================================
    const token = localStorage.getItem('token');
    const userID = JSON.parse(localStorage.UserCache).id;
    */

    if(hw.length > 0) {
        hw.forEach(homework2 => {
            return homeworkArray.push(homework2);
        })
        return homeworkArray;
    }
   
    // for each course in homework
    Object.keys(hw).forEach((date) => {
        //on obtiens une date avec une liste

        //2023-03-17
        hw[date].forEach((homework) => {
            console.log("le homework : " + JSON.stringify(homework))
            // get homework
            let hws = homework;
            //foreach documents
            console.log("a faire : " + JSON.stringify(hws.aFaire))
            if(!hws.aFaire) {
                console.warn("Skip construct of " + JSON.stringify(homework) + " because doesn't contain any \"aFaire\" var")
                return;
            }
            hws.aFaire.documents.forEach((file) => {
                // if no file.name, set it to "Document"
                if (!file.libelle) {
                    file.name = "Document";
                }
                // if file.url is not a link
                /*if (!file.url.startsWith("http")) {
                    // remove file
                    homework.files.splice(homework.files.indexOf(file), 1);
                }*/
            });
            //homework description
            hws.aFaire.contenu = atob(hws.aFaire.contenu)
            console.log("contenu du travail : " + hws.aFaire.contenu)
            let homeworkDescription = hws.aFaire.contenu;
            /*
                Traitement des balises HTML (<strong>, <u>)


            */

            if (homeworkDescription.length > 80) {
                homeworkDescription = homeworkDescription.substring(0, 80);
                homeworkDescription = homeworkDescription.substring(0, homeworkDescription.lastIndexOf(" "));
                homeworkDescription += "...";
            }

            // replace new lines in homework.description with <br/>
            hws.aFaire.contenu = hws.aFaire.contenu.replace(/\n/g, "<br/>");
            // parse links in homework.description
            hws.aFaire.contenu = hws.aFaire.contenu.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');


            // construct course
            let newHomework = {
                data: {
                    id: hws.id,
                    //date: hws.aFaire.donneLe.replace(/-/g, "/"),
                    date: hws.aFaire.donneLe.replace(/-/g, "/"),
                    color: subjectColor.getSubjectColor(hws.matiere, hws.color || "#12d4a6"),
                    done: hws.effectue,
                },
                homework: {
                    subject: hws.matiere,
                    content: hws.aFaire.contenu,
                    shortContent: homeworkDescription,
                },
                files: hws.aFaire.documents,
            };
            subjectColor.setSubjectColor(newHomework.homework.subject, newHomework.data.color, true);

            // push course to courses
            homeworkArray.push(newHomework);

        })
    });

    // return courses
    return homeworkArray;
}

// tick
async function tickHomework(id) {
    // if id starts with "custom_"
    if (id[0].startsWith("custom_")) {
        // return custom homework
        return tickCustomHomework(id[0]);
    }
    else {
        switch (localStorage.loginService) {
            case "pronote":
                // return pronote homework
                return tickPronoteHomework(id);
        }
    }
}

async function tickCustomHomework(id) {
    let customHomeworks = JSON.parse(localStorage.customHomeworks);

    // find homework
    let homework = customHomeworks.find((homework) => {
        return homework.homework.data.id == id;
    });

    // if homework is found
    if (homework) { 
        // toggle homework.done
        homework.homework.data.done = !homework.homework.data.done;
    }

    // save customHomeworks
    localStorage.customHomeworks = JSON.stringify(customHomeworks);
}

// tick pronote homework
async function tickPronoteHomework(data) {
    console.log(data)

    let homeworkID = data[0];
    let dateSet = data[1];

    // get token
    const token = localStorage.getItem('token');
    const API = app.config.globalProperties.$api;

    let dayRequest = new Date(dateSet);
    let dayString = dayRequest.toISOString().split('T')[0];

    let URL = `${API}/homework/changeState`;

    return axios.post(URL, {
        token: token,
        homeworkId: homeworkID,
        dateFrom: dayString,
        dateTo: dayString
    })
}

// export
export {
    tickHomework,
    getHomeworks as default,
}
