// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getHomeworks(date) {
    // as only pronote is supported for now, we can just return the pronote timetable

    // return pronote timetable
    return getPronoteHomework(date);
}

// pronote : get timetable
function getPronoteHomework(date) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const dayRequest = new Date(date);

    // get token
    const token = localStorage.getItem('token');

    // get date as YYYY-MM-DD
    const dayString = dayRequest.toISOString().split('T')[0];

    // construct url (date is a TEST date)
    let URL = `${API}/homework?dateFrom=${dayString}&dateTo=${dayString}&token=${token}`;

    // check if timetable is cached
    let cacheSearch = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
    cacheSearch = cacheSearch.filter((element) => {
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch.length > 0) {
        // return cached timetable in promise
        return new Promise((resolve, reject) => {
            let timetable = JSON.parse(cacheSearch[0].timetable);
            resolve(constructPronoteHomework(timetable));
        });
    }
    else {
        // get timetable from API
        return axios.get(URL)
            .then((response) => {
                // get timetable
                let homeworks = response.data;

                // construct timetable
                homeworks = constructPronoteHomework(homeworks);

                // cache response
                let cache = JSON.parse(localStorage.getItem('HomeworkCache')) || [];
                let cacheElement = {
                    date: dayString,
                    token: token,
                    timetable: JSON.stringify(response.data)
                };
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
            });
    }
}

// pronote : construct timetable
function constructPronoteHomework(hw) {
    // declaring vars
    let homeworkArray = [];

    // for each course in timetable
    hw.forEach((homework) => {
        // construct course
        let newHomework = {
            data: {
                id: homework.id,
                date: homework.date,
                color: homework.background_color,
                done: homework.done,
            },
            homework: {
                subject: homework.subject,
                content: homework.description,
            },
            files: homework.files,
        };

        // push course to courses
        homeworkArray.push(newHomework);
    });

    // return courses
    return homeworkArray;
}

// export
export default getPronoteHomework;