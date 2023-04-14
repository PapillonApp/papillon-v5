// modules
import axios from 'axios';

// vars
import {app} from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import subjectColor from '@/functions/utils/subjectColor.js'
import {ApiUrl, ApiVersion, Kdecole} from 'kdecole-api';
import displayToast from "@/functions/utils/displayToast";

let dayRequest;

// main function
async function getTimetable(date, forceReload) {
    // as only pronote is supported for now, we can just return the pronote timetable
    switch (localStorage.loginService) {
        case "pronote":
            // return pronote timetable
            return getPronoteTimetable(date, forceReload);
        case "ecoledirecte":
            return getEDTimetable(date, forceReload);
        case 'skolengo':
            return getSkolengoTimetable(date, forceReload)
    }
}

function getSkolengoTimetable(date, forceReload) {

    const dayRequest = new Date(date);

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];

    const token = localStorage.getItem('token');
    const ent = localStorage.getItem('ent');


    // check if timetable is cached
    let cacheSearch = JSON.parse(localStorage.getItem('TimetableCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached timetable in promise
        return new Promise((resolve) => {
            let timetable = JSON.parse(cacheSearch[0].timetable);
            resolve(constructSkolengoTimetable(timetable?.listeSeances || []));
        });
    } else {
        const user = new Kdecole(token, ApiVersion[ent], 0, 'https://cors.api.getpapillon.xyz/' + ApiUrl[ent])

        return user.getCalendrier().then(calendrier => {
            if (calendrier.cdtOuvert === false) throw new Error("Le calendrier n'est pas ouvert.")
            const jour = calendrier.listeJourCdt.find(jour => jour.date.toISOString().split('T')[0] === dayString)
            const timetable = constructSkolengoTimetable(jour?.listeSeances || [])

            let cache = JSON.parse(localStorage.getItem('TimetableCache')) || [];
            let cacheElement = {
                date: dayString,
                token: token,
                timetable: JSON.stringify(jour || [])
            };
            cache.push(cacheElement);
            localStorage.setItem('TimetableCache', JSON.stringify(cache));

            return timetable

        }).catch((error) => {
            return new Promise((reject) => {
                displayToast.presentError(`${error.message}`, "danger", error)
                console.error(error)
                reject({
                    error: error.code
                });
            });
        })
    }
}


function constructSkolengoTimetable(seances) {
        return seances.map(seance => ({
            course: {
                id: seance.idSeance,
                subject: seance.matiere,
                color: subjectColor.getSubjectColor(seance.matiere),
                num: null,
                sameTime: false,
                actual: false,
                distance: false,
                lengthCours: 0,
            },
            data: {
                subject: seance.matiere,
                teachers: [' '],
                rooms: [seance.salle],
                groupNames: null,
                memo: seance.aRendre.map(ar => ar.type).join(' '),
                hasMemo: false,
                linkVirtual: null,
            },
            time: {
                start: new Date(seance.hdeb),
                end: new Date(seance.hfin)
            },
            status: {
                isCancelled: !seance.flagActif,
                isExempted: false,
                isDetention: false,
                isOuting: false,
                isTest: false,
                isCustom: false,
                status: seance.motifModif
            }
        })).sort((a, b) => {
            return new Date(a.time.start) - new Date(b.time.start);
        });
    }

// pronote : get timetable
function getPronoteTimetable(date, forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;
    dayRequest = new Date(date);

    // get token
    const token = localStorage.getItem('token');

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];

    // construct url (date is a TEST date)
    let URL = `${API}/timetable?dateString=${dayString}&token=${token}`;

    // check if timetable is cached
    let cacheSearch = JSON.parse(localStorage.getItem('TimetableCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached timetable in promise
        return new Promise((resolve) => {
            let timetable = JSON.parse(cacheSearch[0].timetable);
            resolve(constructPronoteTimetable(timetable));
        });
    } else {
        // get timetable from API
        return axios.get(URL)
            .then((response) => {
                // get timetable
                let timetable = response.data;

                // construct timetable
                timetable = constructPronoteTimetable(timetable);

                // cache response
                let cache = JSON.parse(localStorage.getItem('TimetableCache')) || [];
                let cacheElement = {
                    date: dayString,
                    token: token,
                    timetable: JSON.stringify(response.data)
                };
                cache.push(cacheElement);
                localStorage.setItem('TimetableCache', JSON.stringify(cache));

                document.dispatchEvent(new CustomEvent('connectionState', {detail: 'connected'}));

                // return timetable
                return timetable;
            })
            .catch((error) => {
                if (error.response) {
                    // check if "notfound" or "expired"
                    if (error.response.data == "notfound") {
                        // get new token
                        GetToken();

                        document.dispatchEvent(new CustomEvent('connectionState', {detail: 'disconnected'}));
                    } else if (error.response.data == "expired") {
                        // get new token
                        GetToken();

                        document.dispatchEvent(new CustomEvent('connectionState', {detail: 'disconnected'}));
                    }
                }

                if (error.code) {
                    // return error code
                    return error.code;
                }
            });
    }
}

// pronote : construct timetable
function constructPronoteTimetable(timetable) {
    // declaring vars
    let courses = [];

    // for each course in timetable
    timetable.forEach((course) => {
        // construct course
        let newCourse = {
            course: {
                id: course.id,
                color: subjectColor.getSubjectColor(course.subject.name, course.background_color),
                num: course.num,
                sameTime: false,
                actual: false,
                distance: false,
                lengthCours: 0,
            },
            data: {
                subject: course.subject.name,
                teachers: course.teachers,
                rooms: course.rooms,
                groupNames: course.group_names,
                memo: course.memo,
                hasMemo: false,
                linkVirtual: course.virtual,
            },
            time: {
                start: new Date(course.start.replace(/-/g, "/")),
                end: new Date(course.end.replace(/-/g, "/"))
            },
            status: {
                isCancelled: course.is_cancelled,
                isExempted: course.is_exempted,
                isDetention: course.is_detention,
                isOuting: course.is_outing,
                isTest: course.is_test,
                isCustom: false,
                status: course.status
            }
        };

        if (course.subject.name != "") {
            subjectColor.setSubjectColor(newCourse.data.subject, newCourse.course.color, true);
        }

        if (course.memo != null) {
            newCourse.data.hasMemo = true;
        }

        if (course.is_detention) {
            newCourse.data.subject = "🚨 Retenue";
            newCourse.course.color = "#ff0000";
            newCourse.status.status = "Vous êtes placé en retenue";
        }

        if (course.is_exempted) {
            newCourse.course.color = "#627E66";
            newCourse.status.status = "Vous êtes dispensé de cours";
        }

        // push course to courses
        courses.push(newCourse);
    });

    // put courses in start order
    courses.sort((a, b) => {
        return new Date(a.time.start) - new Date(b.time.start);
    });

    // return courses
    return courses;
}


// ed : get timetable
function getEDTimetable(date, forceReload) {
    // gather vars
    const EDAPI = "https://api.ecoledirecte.com/v3"//app.config.globalProperties.$api;
    dayRequest = new Date(date);

    // get token
    const token = localStorage.getItem('token');
    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];

    const userID = JSON.parse(localStorage.UserCache).id;

    // construct url (date is a TEST date)
    let URL = `${EDAPI}/E/${userID}/emploidutemps.awp?verbe=get`;

    // check if timetable is cached
    let cacheSearch = JSON.parse(localStorage.getItem('TimetableCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached timetable in promise
        return new Promise((resolve) => {
            let timetable = JSON.parse(cacheSearch[0].timetable);
            resolve(constructEDTimetable(timetable));
        });
    } else {
        // get timetable from API

        var requestOptions = {
            headers: {"Content-Type": "application/x-www-form-urlencoded", "X-Token": token},
        };
        let body = `data={
            "dateDebut": "${dayString}",
            "dateFin": "${dayString}",
            "avecTrous": false
        }`
        return axios.post(URL, body, requestOptions)
        .then((response) => {
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
            // get timetable
            let timetable = response.data.data;

                // construct timetable
                timetable = constructEDTimetable(timetable);

                // cache response
                let cache = JSON.parse(localStorage.getItem('TimetableCache')) || [];
                let cacheElement = {
                    date: dayString,
                    token: token,
                    timetable: JSON.stringify(response.data.data)
                };
                cache.push(cacheElement);
                localStorage.setItem('TimetableCache', JSON.stringify(cache));

                // return timetable
                return timetable;
            })
            .catch((error) => {
                if (error.response) {
                    // check if "notfound" or "expired"
                    if (error.response.data.code == 525) {
                        // get new token
                        GetToken();
                    }
                }

                if (error.code) {
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

// ed : construct timetable
function constructEDTimetable(timetable) {
    // declaring vars
    let courses = [];

    // for each course in timetable
    timetable.forEach((course) => {
        // construct course
        let newCourse = {
            course: {
                id: course.id,
                color: subjectColor.getSubjectColor(course.matiere, course.color),
                num: null,//course.num,
                sameTime: false,
                actual: false,
                distance: false,
                lengthCours: 0,
            },
            data: {
                subject: course.matiere,
                teachers: course.prof.split(),
                rooms: course.salle.split(),
                groupNames: course.groupe,
                memo: null, //course.memo,
                hasMemo: false,
                linkVirtual: false,//course.virtual,
            },
            time: {
                start: new Date(course.start_date.replace(/-/g, "/")),
                end: new Date(course.end_date.replace(/-/g, "/"))
            },
            status: {
                isCancelled: course.isAnnule,
                isExempted: course.dispensable,
                isDetention: false, //course.is_detention,
                isOuting: false, //course.is_outing,
                //isTest: course.is_test,
                isCustom: false,
                status: course.isAnnule ? "Cours annulé" : null
            }
        };

        if(course.typeCours == "CONGE") {
            newCourse.data.subject = course.text;
            newCourse.course.color = "#3462e0";
            newCourse.status.status = "Vous êtes en congés";
            newCourse.data.rooms = ["Chez vous"];
            newCourse.data.teachers = ["Aucun prof."]
        }

        if (course.matiere != "") {
            subjectColor.setSubjectColor(newCourse.data.subject, newCourse.course.color, true);
        }

        if (course.memo != null) {
            newCourse.data.hasMemo = true;
        }

        if (course.isModifie) {
            newCourse.status.status = "Le cours a été modifié";
        }

        if (course.is_detention) {
            newCourse.data.subject = "🚨 Retenue";
            newCourse.course.color = "#ff0000";
            newCourse.status.status = "Vous êtes placé en retenue";
        }

        if (course.is_exempted) {
            newCourse.course.color = "#627E66";
            newCourse.status.status = "Vous êtes dispensé de cours";
        }

        // push course to courses
        courses.push(newCourse);
    });

    // put courses in start order
    courses.sort((a, b) => {
        return new Date(a.time.start) - new Date(b.time.start);
    });

    // return courses
    return courses;
}

// export
export default getTimetable;
