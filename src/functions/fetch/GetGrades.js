// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

// main function
async function getGrades() {
    // as only pronote is supported for now, we can just return the pronote timetable
    
    // return pronote timetable
    return getPronoteGrades();
}

// pronote : get timetable
function getPronoteGrades() {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url (date is a TEST date)
    let URL = `${API}/grades?token=${token}`;

    // check if grade is cached
    let gradeCache = localStorage.getItem('gradeCache');

    if(gradeCache != null) {
        // grade is cached, check if it's up to date
        gradeCache = JSON.parse(gradeCache);

        let today = new Date();
        let cacheDate = new Date(gradeCache.date);

        if(today.toDateString() == cacheDate.toDateString()) {
            // grade is up to date, return it
            return new Promise((resolve, reject) => {
                resolve(constructPronoteGrades(gradeCache.grades));
            });
        }
    }

    // send request
    return axios.get(URL)
        .then((response) => {
            if(response.data == 'expired') {
                // token expired, get new token
                GetToken();
            }

            // save timetable to localstorage cache with today's date
            let today = new Date();
            let gradeCache = {
                date: today,
                grades: response.data
            }

            localStorage.setItem('gradeCache', JSON.stringify(gradeCache));

            // construct timetable and return it as a promise
            return new Promise((resolve, reject) => {
                resolve(constructPronoteGrades(response.data));
            });
        })
        .catch((error) => {
            if(error.response.status == 498) {
                // token expired, get new token
                GetToken();
            }

            // error, return error
            return new Promise((resolve, reject) => {
                reject(error);
            });
        });
}

// pronote : construct timetable
function constructPronoteGrades(grades) {    
    let averages = grades.averages;
    let marks = grades.grades;

    let markArray = [];

    // for each mark, add it to the corresponding subject in the array
    marks.forEach(mark => {
        // check if subject exists
        let subject = markArray.find(subject => subject.name == mark.subject.name);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: mark.subject.name,
                marks: []
            }

            markArray.push(subject);
        }

        // add mark to subject
        let newMark = {
            info: {
                subject: mark.subject.name,
                date: mark.date,
                description: mark.description || "Pas d'intitulé",
            },
            grade: mark.grade
        }

        switch (mark.grade.significant) {
            case 0:
                newMark.info.significant = true;
                newMark.info.significantReason = null;
                newMark.info.significantZero = false;
                break;
            case 1:
                newMark.info.significant = false;
                newMark.info.significantReason = "Abs.";
                newMark.info.significantZero = false;
                break;
            case 2:
                newMark.info.significant = false;
                newMark.info.significantReason = "Disp.";
                newMark.info.significantZero = false;
                break;
            case 3:
                newMark.info.significant = false;
                newMark.info.significantReason = "N.Not";
                newMark.info.significantZero = false;
                break;
            case 4:
                newMark.info.significant = false;
                newMark.info.significantReason = "Inap.";
                newMark.info.significantZero = false;
                break;
            case 5:
                newMark.info.significant = false;
                newMark.info.significantReason = "N.Ren";
                newMark.info.significantZero = false;
                break;
            case 6:
                newMark.info.significant = false;
                newMark.info.significantReason = "Abs.";
                newMark.info.significantZero = true;
                break;
            case 7:
                newMark.info.significant = false;
                newMark.info.significantReason = "N.Ren";
                newMark.info.significantZero = true;
                break;
            case 8:
                newMark.info.significant = true;
                newMark.info.significantReason = "Félicitations";
                newMark.info.significantZero = false;
                break;
        }

        delete newMark.grade.significant;

        if (newMark.info.significantZero) {
            newMark.grade.value = 0;
        }

        if (!newMark.info.significant && mark.grade.average == -1) {
            newMark.info.significantAverage = false;
        } else {
            newMark.info.significantAverage = true;
        }

        newMark.info.outOf20 = mark.is_out_of_20;
        newMark.info.bonus = mark.is_bonus;
        newMark.info.optional = mark.is_optional;

        subject.marks.push(newMark);
    });
    
    // sort marks by date
    markArray.forEach(subject => {
        subject.marks.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    });

    // add averages
    averages.forEach(average => {
        // check if subject exists
        let subject = markArray.find(subject => subject.name == average.subject.name);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: average.subject,
                marks: []
            }

            markArray.push(subject);
        }

        // add average to subject
        subject.average = parseFloat(average.average.replace(",", "."));

        subject.class = {};

        subject.class.average = parseFloat(average.class_average);
        subject.class.min = parseFloat(average.min);
        subject.class.max = parseFloat(average.max);
    });

    // calculate averages for each subject in markArray
    let studentAverage = 0;
    let classAverage = 0;
    let classMin = 0;
    let classMax = 0;

    markArray.forEach(subject => {
        studentAverage += subject.average;
        classAverage += subject.class.average;
        classMin += subject.class.min;
        classMax += subject.class.max;
    });

    studentAverage /= markArray.length;
    classAverage /= markArray.length;
    classMin /= markArray.length;
    classMax /= markArray.length;

    // replace StudentAverage with the actual average
    studentAverage = parseFloat(grades.overall_average.replace(",", "."));

    // add averages to array
    let avgs = {
        average: studentAverage,
        class: {
            average: classAverage,
            min: classMin,
            max: classMax
        }
    }

    let finalArray = {
        marks: markArray,
        averages: avgs
    }
    
    return finalArray;
}

// export
export default getPronoteGrades;