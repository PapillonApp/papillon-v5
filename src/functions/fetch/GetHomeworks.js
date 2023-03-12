// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import subjectColor from '@/functions/utils/subjectColor.js'

// main function
async function getHomeworks(dateFrom, dateTo, forceReload) {
    switch(localStorage.loginService) {
        case "pronote":    
            // return pronote homework
            return getPronoteHomework(dateFrom, dateTo, forceReload);
		case "ecoledirecte":
            return getEDHomework(dateFrom, dateTo, forceReload)
    }
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
            resolve(constructPronoteHomework(homework));
        });
    }
    else {
        // get homework from API
        return axios.get(URL)
            .then((response) => {
                // get homework
                let homeworks = response.data;

                // construct homework
                homeworks = constructPronoteHomework(homeworks);

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
                    }
                    else if (error.response.data == "expired") {
                        // get new token
                        GetToken();
                    }
                }

                if(error.code) {
                    // return empty timetable in promise
                    return new Promise((reject) => {
                        reject({
                            error: error.code
                        });
                    });
                }
            });
    }
}

// pronote : construct homework
function constructPronoteHomework(hw) {
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

    // return courses
    return homeworkArray;
}







// ed : get homework
function getEDHomework(dateFrom, dateTo, forceReload) {
    // gather vars
    const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;
    const dayRequest = new Date(dateFrom);
    const dayRequestTo = new Date(dateTo);

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
    }
    else {
        // get homework from API

        var requestOptions = {
            headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": token },            
        };
        let body = `data={}`


        return axios.post(URL, body, requestOptions)
            .then((response) => {
                // get homework
                let homeworks = response.data.data;

                // construct homework
                homeworks = constructEDHomework(homeworks);

                // cache response
                let cache = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
                let cacheElement = {
                    dateFrom: dayString,
                    dateTo: dayStringTo,
                    token: token,
                    homework: JSON.stringify(response.data.data)
                };
                cache.push(cacheElement);
                localStorage.setItem('HomeworkCache', JSON.stringify(cache));

                // return homeworks
                return homeworks;
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data.code == 525) {
                        // get new token
                        GetToken();
                    }
                }

                if(error.code) {
                    // return empty timetable in promise
                    return new Promise((reject) => {
                        reject({
                            error: error.code
                        });
                    });
                }
            });
    }
}

// ed : construct homework
function constructEDHomework(hw) {
    // declaring vars
    let homeworkArray = [];

    
    const token = localStorage.getItem('token');
    const userID = JSON.parse(localStorage.UserCache).id;

    // for each course in homework
    hw.forEach((date) => {
        //on obtiens une date avec une liste
        //2023-03-17
        hw[date].forEach((homework) => {

            let URL = `https://api.ecoledirecte.com/v3/Eleves/${userID}/cahierdetexte/${date}.awp?verbe=get`;
            var requestOptions = {
                headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Token": token },            
            };
            let body = `data={}`


            axios.post(URL, body, requestOptions)
            .then((response) => {
                // get homework
                let homeworks = response.data.data;

                homeworks.matieres.forEach((hws) => {
                    
                    //foreach documents
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
                            date: hws.donneLe.replace(/-/g, "/"),
                            color: subjectColor.getSubjectColor(hws.matiere, hws.color || "#12d4a6"),
                            done: hws.effectue,
                        },
                        homework: {
                            subject: hws.matiere,
                            content: hws.description,
                            shortContent: homeworkDescription,
                        },
                        files: hws.aFaire.documents,
                    };

                    subjectColor.setSubjectColor(newHomework.homework.subject, newHomework.data.color, true);

                    // push course to courses
                    homeworkArray.push(newHomework);

                })
            })
            .catch((error) => {
                if (error.response) {
                    if (error.response.data.code == 525) {
                        // get new token
                        GetToken();
                    }
                }

                if(error.code) {
                    // return empty timetable in promise
                    return new Promise((reject) => {
                        reject({
                            error: error.code
                        });
                    });
                }
            });
        })
    });

    // return courses
    return homeworkArray;
}



// export
export default getHomeworks;