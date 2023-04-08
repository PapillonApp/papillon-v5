// modules

// vars
import getTimetable from './GetTimetable';
import getHomeworks from './GetHomeworks';
import getGrades from './GetGrades';
import getNews from './GetNews';

// main function
async function getRecap(force) {
    switch (localStorage.loginService) {
        case "pronote":
            // return pronote timetable
            return getPronoteRecap(force);
        case "ecoledirecte":
            return getEDRecap(force);
        case 'skolengo':
            return getSkolengoRecap(force)
    }
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
        let errorsDone = 0;

        let errors = [];

        // timetable
        getTimetable(new Date(), force).then((response) => {
            if (response == "ERR_NETWORK") {
                errorsDone++;
                errors.push(response);
            } else {
                timetable = response;
                requestsDone++;
            }
        })
        // homeworks
        let today = new Date();

        let endDate = new Date();
        endDate.setDate(endDate.getDate() + 3);

        getHomeworks(today, endDate, force).then((response) => {
            if (response == "ERR_NETWORK") {
                errorsDone++;
                errors.push(response);
            } else {
                homeworks = response;
                requestsDone++;
            }
        })

        // grades
        getGrades(force).then((response) => {
            if (response == "ERR_NETWORK") {
                errorsDone++;
                errors.push(response);
            } else {
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
            }
        })

        // news
        getNews(force).then((response) => {
            if (response == "ERR_NETWORK") {
                errorsDone++;
                errors.push(response);
            } else {
                news = response;
                requestsDone++;
            }
        })

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

            if (errorsDone == 2) {
                clearInterval(interval);

                // return recap
                reject({
                    errors: errors
                });
            }
        });

    });

}

// ed : get timetable
function getEDRecap(force) {
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

		/*// news
		getNews(force).then((response) => {
			news = response;
			requestsDone++;
		});*/

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


async function getSkolengoRecap(force) {
    const timetable = await getTimetable(new Date(), force)
    const homeworks = await getHomeworks(new Date(), new Date(), force)

    return {
        timetable,
        homeworks
    };
}

// export
export default getRecap
