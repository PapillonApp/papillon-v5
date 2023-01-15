/* give 50 random colors of all hues but with enough contrast with white text */
let colors = ['#2E3A59', '#4A68A3', '#5B86C3', '#619AD0', '#7CAFD8', '#9CBDBA', '#A9B7A8', '#BCBCBC', '#B2D1B2', '#4A766E', '#5B86C3', '#5E8A71', '#5FA98A', '#6FCF9C', '#7CAFD8', '#8A8A8E', '#A29A9C', '#B9D1B9', '#737373', '#847A97', '#A29A9C', '#AFB3B7', '#B2D1B2', '#4A766E', '#5E8A71', '#5FA98A', '#6FCF9C', '#7CAFD8', '#8A8A8E', '#A29A9C', '#B9D1B9'];

function getRandomColor() {
	let attributedColors = JSON.parse(localStorage.getItem('SubjectColors')) || {};
	
	// remove all colors that are already attributed
	colors = colors.filter(color => !Object.values(attributedColors).includes(color));

	// return a random color from the colors array
	return colors[Math.floor(Math.random() * colors.length)];
}

function LightenDarkenColor(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;
    
    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
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
	
	return setSubjectColor(subjectName, getRandomColor());
}

export default { setSubjectColor, getSubjectColor, getRandomColor, lightenColor, darkenHexColor };