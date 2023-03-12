// modules
import axios from 'axios';

// vars
import { app } from '@/main.ts'
import GetToken from '@/functions/login/GetToken.js';

import getTimetable from './GetTimetable';
import getHomeworks from './GetHomeworks';
import getGrades from './GetGrades';
import getNews from './GetNews';

// main function
async function getRecap(force) {
	// as only pronote is supported for now, we can just return the pronote timetable
	
	// return pronote timetable
	return getPronoteRecap(force);
}

// pronote : get timetable
function getPronoteRecap(force) {
	// promise
	return new Promise((resolve, reject) => {
		// vars
		let timetable = []
		let homeworks = []
		let grades = {
			full: [],
			last: []
		}
		let news = []

		let requestsDone = 0;
		
		// timetable
		getTimetable(new Date(), force).then((response) => {
			timetable = response;
			requestsDone++;
		});

		// homeworks
		let today = new Date();

		let endDate = new Date();
		endDate.setDate(endDate.getDate() + 3);

		getHomeworks(today, endDate, force).then((response) => {
			homeworks = response;
			requestsDone++;
		});

		// grades
		getGrades(force).then((response) => {
			grades.full = response;
			requestsDone++;

			// get all grades in all subjects
			let allGrades = [];
			for (let i = 0; i < grades.full.marks.length; i++) {
				for (let j = 0; j < grades.full.marks[i].marks.length; j++) {
					let newGrade = grades.full.marks[i].marks[j];
					// add subject data
					newGrade.subject = {
						name: grades.full.marks[i].name,
						color: grades.full.marks[i].color,
						id: grades.full.marks[i].id
					};

					allGrades.push(newGrade);
				}
			}

			// sort grades by date
			allGrades.sort((a, b) => {
				return new Date(b.info.date) - new Date(a.info.date);
			});

			// get last 5 grades
			for (let i = 0; i < 5; i++) {
				if (allGrades[i] != undefined) {
					grades.last.push(allGrades[i]);
				}
			}
		});

		// news
		getNews(force).then((response) => {
			news = response;
			requestsDone++;
		});

		// wait for all requests to be done
		let interval = setInterval(() => {
			if (requestsDone == 4) {
				clearInterval(interval);

				// return recap
				resolve({
					timetable: timetable,
					homeworks: homeworks,
					grades: grades,
					news: news
				});
			}
		});

	});

}

// export
export default getPronoteRecap