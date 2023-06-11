/* give 50 random colors of all hues but with enough contrast with white text */
let colors = ['#1E90FF', '#228B22', '#8B008B', '#F7A139', '#4B0082', '#43C59E', '#5C80BC', '#F15152', '#1244B8', '#17BEBB', '#6B8E23', '#72408A', '#B8860B', '#9B4BBD', '#F0E68C', '#FF69B4', '#008080', '#D46C17', '#209488', '#008704', '#4C7B8B'];

function getRandomColor(returnAll=false) {
	const attributedColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};
	
	// remove all colors that are already attributed
	if (!returnAll) {
		colors = colors.filter(color => !Object.values(attributedColors).includes(color));
	}

	if (colors.length == 0) {
		return '#6AB764';
	}

	// return a random color from the colors array
	return colors[Math.floor(Math.random() * colors.length)];
}

function lightenColor(color, percent) {
	const num = parseInt(color,16),
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
	const subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

	if (!color.includes('#')) {
		color = '#' + color;
	}

	if (subjectColors[subjectName] != undefined && !force) {
		return subjectColors[subjectName];
	}

	if (subjectColors[subjectName] == color) {
		return subjectColors[subjectName];
	}

	subjectColors[subjectName] = color;

	localStorage.setItem('SubjectColors', JSON.stringify(subjectColors));

	return color;
}

function getSubjectColor(subjectName, color, custom=false) {
	const subjectColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};

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
	
	if (localStorage.getItem('useScolColors') != 'true' && !custom) {
		color = getRandomColor()
	}

	return setSubjectColor(subjectName, color);
}

export default { setSubjectColor, getSubjectColor, getRandomColor, lightenColor, darkenHexColor };