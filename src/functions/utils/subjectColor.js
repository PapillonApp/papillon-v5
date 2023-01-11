let colorList = [
	'#00B562',
	'#0FBA9B',
	'#1A8DCE',
	'#30B800',
	'#4791FF',
	'#898989',
	'#8CBC4F',
	'#9747FF',
	'#A725C8',
	'#AF5757',
	'#C567FF',
	'#C84325',
	'#C87325',
	'#E1006C',
	'#F13232',
	'#F422AD',
	'FF6A3A',
	'#FFB629',
];

function distance(a, b) {
    return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
}

function nearestColor(color) {
	// get closest color from colorList
	let min = 1000000;
	let closestColor = colorList[0];
	for (let i = 0; i < colorList.length; i++) {
		let dist = distance(color, colorList[i]);
		if (dist < min) {
			min = dist;
			closestColor = colorList[i];
		}
	}
}

function getRandomColor() {
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += Math.floor(Math.random() * 10);
	}
	return color;
}

function lightenColor(color, percent) {
	var num = parseInt(color,16),
		amt = Math.round(2.55 * percent),
		R = (num >> 16) + amt,
		B = (num >> 8 & 0x00FF) + amt,
		G = (num & 0x0000FF) + amt;
		return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
}

function darkenHexColor(col) {
	return '#' + lightenColor(col, -20);
}

function setSubjectColor(subjectName, color, force=false) {
	let subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

	if (!color.includes('#')) {
		color = '#' + color;
	}

	if (subjectColors[subjectName] && !force) {
		return subjectColors[subjectName];
	}

	if (subjectColors[subjectName] == color) {
		return subjectColors[subjectName];
	}

	subjectColors[subjectName] = color;

	localStorage.setItem('SubjectColors', JSON.stringify(subjectColors));

	return color;
}

function getSubjectColor(subjectName, color) {
	let subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

	if (subjectName.includes('>')) {
		subjectName = subjectName.split(' > ')[0];
	} else if (subjectName.includes('&')) {
		true // do nothing
	} else if (subjectName.split(' ').length > 1) {
		subjectName = subjectName.split(' ')[0];
	} 

	if (subjectColors[subjectName]) {
		return subjectColors[subjectName];
	}

	return setSubjectColor(subjectName, color);
}

export default { setSubjectColor, getSubjectColor, getRandomColor, lightenColor, darkenHexColor };