// modules
const ics = require('ics')

import { Browser } from '@capacitor/browser';

// vars
import GetTimetable from '@/functions/fetch/GetTimetable.js';

async function exportIcal(rn) {
    let rnDate = new Date(rn);

    // get monday and sunday of the week of rn
    const monday = new Date(rnDate);
    monday.setDate(monday.getDate() - monday.getDay() + 1);

    let timetables = [];
    let done = 0;

    // get timetable for each day
    for (let i = 0; i < 7; i++) {
        // get timetable for day
        let day = new Date(monday);
        day.setDate(day.getDate() + i);
        
        GetTimetable(day, false).then((timetable) => {
            // add timetable to array
            timetables.push(timetable);
            done++;
        });
    }

    // wait for all timetables to be fetched
    let waitFinish = setInterval(() => {
        if (done == 7) {
            parseCoursIcal(timetables);
            clearInterval(waitFinish);
        }
    }, 100);
}

function parseCoursIcal(timetables) {
    let allICS = [];

    // count number of subjects
    let subjectCount = 0;
    for (let i = 0; i < timetables.length; i++) {
        subjectCount += timetables[i].length;
    }

    // for each day
    for (let i = 0; i < timetables.length; i++) {
        // for each subject
        for (let j = 0; j < timetables[i].length; j++) {
            let parsed = parseICS(timetables[i][j]);

            allICS.push(parsed);

            // if all subjects have been parsed
            if (allICS.length == subjectCount) {
                downloadICS(allICS);
            }
        }
    }
}

async function downloadICS(icsList) {
    // remove empty strings
    icsList = icsList.filter((element) => {
        return element != "";
    });

    let finalICS = `BEGIN:VCALENDAR
`;

    // for each in icsList
    for (let i = 0; i < icsList.length; i++) {
        /*
        BEGIN:VEVENT
        ics
        END:VEVENT
        */

        // remove everything before BEGIN:VEVENT
        let start = icsList[i].indexOf('BEGIN:VEVENT');
        icsList[i] = icsList[i].substring(start);

        // remove everything after END:VEVENT
        let end = icsList[i].indexOf('END:VEVENT');
        icsList[i] = icsList[i].substring(0, end + 11);

        finalICS += icsList[i];

        // add new line
        finalICS += `
`;

        // if last element
        if (i == icsList.length - 1) {
            // remove last new line
            finalICS = finalICS.substring(0, finalICS.length - 1);

            finalICS += `
END:VCALENDAR`;

            console.log(finalICS);
        
            // download file
            const file = new Blob([finalICS], {type: 'text/plain'});
            var href = URL.createObjectURL(file);
            
            await Browser.open({
                url: href,
                presentationStyle: 'popover',
            });
        }
    }
}

function parseICS(subject) {
    let start = new Date(subject.time.start);
    let end = new Date(subject.time.end);

    let startICS = [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()];
    let endICS = [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()];

    let duration = {
        hours: end.getHours() - start.getHours(),
        minutes: end.getMinutes() - start.getMinutes()
    }

    let categories = [];
    
    // for each in subject.data.groupNames
    for (let i = 0; i < subject.data.groupNames.length; i++) {
        categories.push(subject.data.groupNames[i]);
    }

    if (subject.status.isCancelled) {
        return "";
    }

    const event = {
        start: startICS,
        duration: duration,
        title: subject.data.subject,
        description: 'Vous avez cours de ' + subject.data.subject + ' avec ' + subject.data.teachers.join(', ') + ' dans la salle ' + subject.data.rooms.join(', ') + '.',
        location: subject.data.rooms.join(', '),
        categories: categories,
        organizer: { name: subject.data.teachers[0] },
        attendees: [
          { name: subject.data.teachers[0], role: 'Professeur' },
        ]
    }

    return ics.createEvent(event, (error, value) => {
        if (error) {
            console.log(error)
            return "";
        }

        return value;
    })
}

export default exportIcal;