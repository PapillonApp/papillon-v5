// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getTimetable(date) {
    // as only pronote is supported for now, we can just return the pronote timetable
    
    // return pronote timetable
    return getPronoteTimetable(date);
}

// pronote : get timetable
function getPronoteTimetable(date) {
    // gather vars
    const API = app.config.globalProperties.$api;
    const dayRequest = new Date(date);

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
    if (cacheSearch.length > 0) {
        // return cached timetable in promise
        return new Promise((resolve, reject) => {
            let timetable = JSON.parse(cacheSearch[0].timetable);
            resolve(constructPronoteTimetable(timetable));
        });
    }
    else {
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

            // return timetable
            return timetable;
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
function constructPronoteTimetable(timetable) {
    // declaring vars
    let courses = [];

    // for each course in timetable
    timetable.forEach((course) => {
        // construct course
        let newCourse = {
            course: {
                id: course.id,
                color: course.background_color,
            },
            data: {
                subject: course.subject,
                teacher: course.teacher,
                room: course.room
            },
            time: {
                start: new Date(course.start),
                end: new Date(course.end)
            },
            status: {
                isCancelled: course.is_cancelled,
                status: course.status,
                groupName: course.group_name
            }
        };

        // push course to courses
        courses.push(newCourse);
    });

    // put courses in start order
    courses.sort((a, b) => {
        return a.time.start - b.time.start;
    });

    // return courses
    return courses;
}

// export
export default getPronoteTimetable;