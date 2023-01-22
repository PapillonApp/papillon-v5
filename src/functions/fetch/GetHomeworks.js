// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import subjectColor from '@/functions/utils/subjectColor.js'

// main function
async function getHomeworks(dateFrom, dateTo, forceReload) {
    // as only pronote is supported for now, we can just return the pronote homework

    // return pronote homework
    return getPronoteHomework(dateFrom, dateTo, forceReload);
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
        return element.date == dayString && element.token == token;
    });
    if (cacheSearch.length > 0 && !forceReload) {
        // return cached homework in promise
        return new Promise((resolve, reject) => {
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
                    date: dayString,
                    token: token,
                    homework: JSON.stringify(response.data)
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

                if(error.code) {
                    // return empty timetable in promise
                    return new Promise((resolve, reject) => {
                        resolve({
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

        // construct course
        let newHomework = {
            data: {
                id: homework.id,
                date: homework.date,
                color: subjectColor.getSubjectColor(homework.subject.name, subjectColor.getRandomColor()),
                done: homework.done,
            },
            homework: {
                subject: homework.subject.name,
                content: homework.description,
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

// export
export default getPronoteHomework;