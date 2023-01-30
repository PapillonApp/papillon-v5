// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import subjectColor from '@/functions/utils/subjectColor.js'
import { Cpu } from 'lucide-vue-next';

// funcs
function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

// main function
async function getGrades(forceReload) {
    // as only pronote is supported for now, we can just return the pronote grades
    
    // return pronote grades
    return getPronoteGrades(forceReload);
}

// pronote : get grades
function getPronoteGrades(forceReload) {
    // gather vars
    const API = app.config.globalProperties.$api;

    // get token
    const token = localStorage.getItem('token');

    // construct url (date is a TEST date)
    let URL = `${API}/grades?token=${token}`;

    // check if grade is cached
    let gradeCache = localStorage.getItem('GradeCache');

    if(gradeCache != null && !forceReload) {
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

            // save grades to localstorage cache with today's date
            let today = new Date();
            let gradeCache = {
                date: today,
                grades: response.data
            }

            localStorage.setItem('GradeCache', JSON.stringify(gradeCache));

            // construct grades and return it as a promise
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

function determineSignificant(significant, service) {
    let result = {
        significant: true,
        significantReason: null,
        significantZero: false,
    }

    if (service == 'pronote') {
        switch (significant) {
            case 0:
                result.significant = true;
                result.significantReason = null;
                result.significantZero = false;
                break;
            case 1:
                result.significant = false;
                result.significantReason = "Abs.";
                result.significantZero = false;
                break;
            case 2:
                result.significant = false;
                result.significantReason = "Disp.";
                result.significantZero = false;
                break;
            case 3:
                result.significant = false;
                result.significantReason = "N.Not";
                result.significantZero = false;
                break;
            case 4:
                result.significant = false;
                result.significantReason = "Inap.";
                result.significantZero = false;
                break;
            case 5:
                result.significant = false;
                result.significantReason = "N.Ren";
                result.significantZero = false;
                break;
            case 6:
                result.significant = false;
                result.significantReason = "Abs.";
                result.significantZero = true;
                break;
            case 7:
                result.significant = false;
                result.significantReason = "N.Ren";
                result.significantZero = true;
                break;
            case 8:
                result.significant = false;
                result.significantReason = "Disp.";
                result.significantZero = true;
                break;
            case -1:
                result.significant = false;
                result.significantReason = null;
                result.significantZero = false;
                break;
        }
    }

    return result;
}

function generateRandomId() {
	return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function groupSubjects(subjectData, markArray) {
	let subject = []
	let subjectName = '';
	let subjectId = '';
	let grouped = false;
	let excluded = false;

	if (localStorage.getItem('groupSubjects') != 'true') {
		subject = markArray.find(subject => subject.id == subjectData.id);
		subjectName = subjectData.name;
		subjectId = subjectData.id;
	} else {
		if (localStorage.getItem('excludedGroupSubjects') != null) {
			let excludedGroupSubjects = JSON.parse(localStorage.getItem('excludedGroupSubjects'));
			for (let i = 0; i < excludedGroupSubjects.length; i++) {
				if (subjectData.name.split(' > ')[0] == excludedGroupSubjects[i]) {
					excluded = true;
					break;
				} else {
					excluded = false;
				}
			}
		}

		if (excluded) {
			subject = markArray.find(subject => subject.id == subjectData.id);
			subjectName = subjectData.name;
			subjectId = subjectData.id;
		} else {
			subject = markArray.find(subject => subject.name == subjectData.name.split(' > ')[0]);
			subjectName = subjectData.name.split(' > ')[0];
			subjectId = subjectData.id;

			if (subjectData.name.split(' > ').length > 1) {
				grouped = true;
				subjectId = generateRandomId();
			}
		}
	}

	return {
		subject: subject, 
		subjectName: subjectName, 
		subjectId: subjectId, 
		grouped: grouped
	}
}

// pronote : construct grades
function constructPronoteGrades(grades) {    
    let averages = grades.averages;
    let marks = grades.grades;

    let markArray = [];

    // for each mark, add it to the corresponding subject in the array
    marks.forEach(mark => {
        // check if subject exists
		let { subject, subjectName, subjectId, grouped } = groupSubjects(mark.subject, markArray);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: subjectName,
                id: subjectId,
                grouped: grouped,
                marks: []
            }

            markArray.push(subject);
        }

        // add mark to subject
        let newMark = {
            info: {
                subject: subjectName,
                date: mark.date,
                description: mark.description || "Pas d'intitulé",
            },
            grade: mark.grade
        }

        // determine if mark is significant
        let significant = determineSignificant(mark.grade.significant, 'pronote');
        newMark.info.significant = significant.significant;
        newMark.info.significantReason = significant.significantReason;
        newMark.info.significantZero = significant.significantZero;

        delete newMark.grade.significant;

        if (newMark.info.significantZero) {
            newMark.grade.value = 0;
        }

        if (!newMark.info.significant && mark.grade.average == -1) {
            newMark.info.significantAverage = false;
        } else {
            newMark.info.significantAverage = true;
        }

        if (!newMark.info.significant && newMark.info.significantReason == null) {
            return; // It's an empty mark so don't show it on the tab
        }

        newMark.info.outOf20 = mark.is_out_of_20;
        newMark.info.bonus = mark.is_bonus;
        newMark.info.optional = mark.is_optional;

        newMark.grade.value = parseFloat(newMark.grade.value).toFixed(2);

        if(isFloat(newMark.grade.average)) {
            newMark.grade.average = parseFloat(newMark.grade.average).toFixed(2);
        }
        
        if(isFloat(newMark.grade.min)) {
            newMark.grade.min = parseFloat(newMark.grade.min).toFixed(2);
        }

        if(isFloat(newMark.grade.max)) {
            newMark.grade.max = parseFloat(newMark.grade.max).toFixed(2);
        }

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
		
		let { subject, subjectName, subjectId, grouped } = groupSubjects(average.subject, markArray);

        if(subject == undefined) {
            // subject doesn't exist, create it
            subject = {
                name: subjectName,
                id: subjectId,
				grouped: grouped,
                marks: []
            }

            markArray.push(subject);
        }

        // determine if average is significant
        let significant = determineSignificant(average.significant, 'pronote');
        subject.significant = significant.significant;
        subject.significantReason = significant.significantReason;
        subject.significantZero = significant.significantZero;

        if (subject.significantZero) {
            subject.average = 0;
        }

        if (!subject.significant && average.class_average == -1) {
            subject.significantAverage = false;
        } else {
            subject.significantAverage = true;
        }

		
		subject.color = subjectColor.getSubjectColor(subjectName, subjectColor.getRandomColor()),
        subject.class = {};

		if (!subject.grouped) {
			subject.class.average = average.class_average;
			subject.class.min = average.min;
			subject.class.max = average.max;
			subject.average = average.average;
		} else {
			let studentAverage = 0;
			let classAverage = 0;
			let classMin = 0;
			let classMax = 0;

			subject.marks.forEach(mark => {
				let coef = mark.grade.coefficient;

				studentAverage += mark.grade.value * coef;
				classAverage += mark.grade.average * coef;
				classMin += mark.grade.min * coef;
				classMax += mark.grade.max * coef;
			});

			subject.average = parseFloat((studentAverage / subject.marks.reduce((a, b) => a + (b.grade.coefficient * b.grade.out_of), 0) * 20).toFixed(2));
			subject.class.average = parseFloat((classAverage / subject.marks.reduce((a, b) => a + (b.grade.coefficient * b.grade.out_of), 0) * 20).toFixed(2));
			subject.class.min = parseFloat((classMin / subject.marks.reduce((a, b) => a + (b.grade.coefficient * b.grade.out_of), 0) * 20).toFixed(2));
			subject.class.max = parseFloat((classMax / subject.marks.reduce((a, b) => a + (b.grade.coefficient * b.grade.out_of), 0) * 20).toFixed(2));
		}
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

    if (studentAverage != -1 && studentAverage != undefined) {
        studentAverage = grades.overall_average;
    }

    if (grades.class_overall_average != -1 && grades.class_overall_average != undefined) {
        classAverage = grades.class_overall_average;
    }

    let avgs = {
        average: studentAverage,
        class: {
            average: classAverage,
            min: classMin,
            max: classMax
        }
    }

    // order all subjects by date
    markArray.forEach(subject => {
        subject.marks.sort((a, b) => {
            return new Date(b.info.date) - new Date(a.info.date);
        });
    });

    markArray.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });


    let finalArray = {
        marks: markArray,
        averages: avgs
    }
    
    return finalArray;
}

// export
export default getPronoteGrades;