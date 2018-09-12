// Provides an object which draws "neon" looking text on an SVG element using relative paths.

// PRIVATE -------------------------------------------------------------------------------------------------------------

const CHR_WIDTH = 50;									// Default width of a character
const KERN_WIDTH = 20;								// Space between characters

const _defaults = {
	stroke: '#66FF66',
	strokeLineCap: 'round',
	strokeLineJoin: 'round',
	strokeWidth: 2
};

let _charactersConverted;
let _nextGroupId = 100;

let _characters = {
	"'": {y:-5, p:'v 10', w:-1},
	',': {y:95, p:'v 5 m 1 -5 v 5 m 1 -5 v 12', w:2},
	':': {x:5, y:20, p:'v 5 m 0 50 v 5', w:10},
	'<': {x:34, y:10, p:'l -29 35 q -5 5 0 10 l 29 35', w:42},
	'>': {x:8, y:10, p:'l 29 35 q 5 5 0 10 l -29 35', w:42},
	'-': {y:50, p:'h 50'},
	'=': {y:40, p:'h 50 m 0 20 h -50'},
	'+': {y:50, p:'h 50 m -25 -5 v -20 m 0 30 v 20'},
	'[': {x:20, p:'h -15 q -5 0 -5 5 v 90 q 0 5 5 5 h 15', w:20},
	']': {p:'h 15 q 5 0 5 5 v 90 q 0 5 -5 5 h -15', w:20},
	0: {x:20, y:0, p:'h 10 q 20 0 20 20 v 60 q 0 20 -20 20 h -10 q -20 0 -20 -20 v -60 q 0 -20 20 -20 m -10 90 l 30 -80'},
	1: {x:15, y:0, p:'h 5 q 5 0 5 5 v 91 m -25 4 h 50'},
	2: {p:'h 45 q 5 0 5 5 v 40 q 0 5 -5 5 h -40 q -5 0 -5 5 v 40 q 0 5 5 5 h 45'},
	3: {p:'h 45 q 5 0 5 5 v 90 q 0 5 -5 5 h -45 m 10 -50 h 34'},
	4: {p:'v 45 q 0 5 5 5 h 40 m 10 -50 v 100'},
	5: {x:50, p:'h -45 q -5 0 -5 5 v 40 q 0 5 5 5 h 25 q 20 0 20 20 v 10 q 0 20 -20 20 h -30'},
	6: {p:'v 80 q 0 20 20 20 h 10 q 20 0 20 -20 v -10 q 0 -20 -20 -20 h -2 q -20 0 -20 10'},
	7: {p:'h 40 q 10 0 7 7 l -40 93'},
	8: {y:52, p:'v 38 q 0 10 10 10 h 30 q 10 0 10 -10 v -30 q 0 -10 -10 -10 h -30 q -10 0 -10 -10 v -30 q 0 -10 10 -10 h 30 q 10 0 10 10 v 38'},
	9: {x:50, y:100, p:'v -95 q 0 -5 -5 -5 h -40 q -5 0 -5 5 v 40 q 0 5 5 5 h 40'},
	A: {y:100, p:'v -80 q 0 -20 20 -20 h 10 q 20 0 20 20 v 80 m -4 -50 h -42'},
	B: {y:48, p:'v -43 q 0 -5 5 -5 h 25 q 20 0 20 20 v 10 q 0 20 -20 20 h -25 q -5 0 -5 5 v 40 q 0 5 5 5 h 25 q 20 0 20 -20 v -10 q 0 -20 -10 -20'},
	C: {x:50, y:20, p:'q 0 -20 -20 -20 h -10 q -20 0 -20 20 v 60 q 0 20 20 20 h 10 q 20 0 20 -20'},
	D: {x:5, p:'h 25 q 20 0 20 20 v 60 q 0 20 -20 20 h -25 q -5 0 -5 -5 v -90 q 0 -5 5 -5'},
	E: {x:50, p:'h -45 q -5 0 -5 5 v 90 q 0 5 5 5 h 45 m -46 -50 h 35'},
	F: {x:50, p:'h -45 q -5 0 -5 5 v 95 m 4 -50 h 35'},
	G: {x:50, p:'h -30 q -20 0 -20 20 v 60 q 0 20 20 20 h 10 q 20 0 20 -20 v -25 q 0 -5 -5 -5 h -41'},
	H: {p:'v 100 m 50 0 v -100 m -46 50 h 42'},
	I: {p:'h 50 m 0 100 h -50 m 25 -4 v -92'},
	J: {y:80, p:'q 0 20 20 20 h 10 q 20 0 20 -20 v -80'},
	K: {p:'v 100 m 50 -100 l -45 45 q -5 5 0 10 l 45 45'},
	L: {p:'v 95 q 0 5 5 5 h 45'},
	M: {y:100, p:'v -95 q 0 -5 5 -5 q 2 0 4 2 l 21 80 q 2 5 4 0 l 21 -80 m 9 98 v -95 q 0 -5 -5 -5 q -2 0 -4 2', w:64},
	N: {y:100, p:'v -95 q 0 -5 5 -5 q 2 0 4 2 l 32 95 m 9 -98 v 95 q 0 5 -5 5 q -2 0 -4 -2'},
	O: {y:20, p:'v 60 q 0 20 20 20 h 10 q 20 0 20 -20 v -60 q 0 -20 -20 -20 h -10 q -20 0 -20 20'},
	P: {y:100, p:'v -95 q 0 -5 5 -5 h 25 q 20 0 20 20 v 10 q 0 20 -20 20 h -26'},
	Q: {y:20, p:'v 60 q 0 20 20 20 h 10 q 20 0 20 -20 v -60 q 0 -20 -20 -20 h -10 q -20 0 -20 20 m 35 65 l 7 7 m 5 5 l 5 5 '},
	R: {y:100, p:'v -95 q 0 -5 5 -5 h 25 q 20 0 20 20 v 10 q 0 20 -20 20 h -26 m 46 50 v -30 q 0 -20 -10 -20'},
	S: {x:50, p:'h -25 q -25 0 -25 25 q 0 25 25 25 q 25 0 25 25 q 0 25 -25 25 h -25'},
	T: {p:'h 50 m -25 4 v 96'},
	U: {p:'v 80 q 0 20 20 20 h 10 q 20 0 20 -20 v -80'},
	V: {p:'l 23 95 q 2 5 4 0 l 27 -95'},
	W: {p:'v 95 q 0 5 5 5 q 2 0 4 -2 l 21 -80 q 2 -5 4 0 l 21 80 m 9 -98 v 95 q 0 5 -5 5 q -2 0 -4 -2', w:64},
	X: {p:'l 50 100 m -50 0 l 22 -46 m 6 -8 l 22 -46'},
	Y: {p:'l 23 45 q 2 5 4 0 l 23 -45 m -25 50 v 50'},
	Z: {p:'h 44 m 3 100 h -44 m 0 -4 l 44 -92 m -3 -4 q 5 0 3 4 m -41 96 q -5 0 -3 -4'},
};


// _convertCharactersToArrays()
// Converts the path property of each character from a string to an array of letters and numbers for faster processing.
// This process happens only the first time the function is called.
function _convertCharactersToArrays() {
	if (!_charactersConverted) {
		_charactersConverted = true;

		Object.keys(_characters).forEach(sKey => {
			let oChar = _characters[sKey];

			_characters[sKey].p = oChar.p.split(' ').map(vVal => {
				let iVal = parseInt(vVal);
				return Number.isNaN(iVal) ? vVal : iVal;
			});
		});
	}
}


// _createElement(sTag[, oAttr])
// Creates an SVG element of the specified tag type and adds optional attributes.
function _createElement(sTag, oAttr) {
	let dRet = document.createElementNS('http://www.w3.org/2000/svg', sTag);

	if (oAttr) {
		Object.keys(oAttr).forEach(sAttr => {
			dRet.setAttribute(sAttr, oAttr[sAttr])
		});
	}

	return dRet;
}


// _resolvePath(oChar, nX, nY, nRatio)
// Resolves a character path array back into a string by multiplying all numbers by the ratio provided.
function _resolvePath(oChar, nX, nY, nRatio) {
	const aPath = oChar.p;
	const nOrigX = oChar.x || 0;
	const nOrigY = oChar.y || 0;
	let sRet = `M ${nX + (nOrigX * nRatio)} ${nY + (nOrigY * nRatio)}`;

	for (let i = 0, l = aPath.length; i < l; ++i) {
		const vVal = aPath[i];
		sRet += ' ' + (typeof vVal === 'string' ? vVal : (vVal * nRatio));
	}

	return sRet;
}


// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

	/// default(sKey[, vVal])
	/// Gets current value (and optionally sets new value) for the specified default property.
	/// 	sKey	- Name of default property (stroke, strokeWidth, etc).
	/// 	vVal	- [undefined] If not undefined, sets the default to the value.
	/// Returns the current/previous value.
	default(sKey, vVal) {
		let vRet = _defaults[sKey];

		if (typeof vVal !== 'undefined') {
			_defaults[sKey] = vVal;
		}

		return vRet;
	},


	/// widthOf(sText, nSize)
	/// Get the width of the text provided at the specified size.
	/// 	sText	- Text to get the width of.
	/// 	nSize	- Size of text as a decimal percentage.
	/// Returns the width of the text in SVG pixels.
	widthOf(sText, nSize) {
		const nChrW = (CHR_WIDTH * nSize);
		const nSpcW = (KERN_WIDTH * nSize);

		return sText.toUpperCase().split('').reduce((nPrev, sChar) => {
			let nW;
			const oChar = _characters[sChar];

			if (oChar) {
				nW = (oChar.w ? oChar.w * nSize : nChrW) + nSpcW;
			} else {
				nW = nChrW;
			}

			return nPrev + nW;
		}, 0);
	},


	/// write(sText, nX, nY, nSize[, oOpts])
	/// Creates an SVG group <g> which contains SVG paths for drawing letters to write the specified text.
	/// 	sText	- Text to write (converted to upper case).
	/// 	nX		- X coordinate for text.
	/// 	nY		- Y coordinate for text.
	/// 	nSize	- Size/height of text as a decimal percentage.
	/// 	oOpts	- [null] Additional options:
	/// 						hide						- [false] If true, element starts with an opacity of zero.
	/// 						id							- ['grp[n]'] ID for group element.
	/// 						strokeWidth			- ['rgb(253, 14, 56)'] SVG stroke property.
	/// 						strokeLineCap		- SVG strokeLineCap property.
	/// 						strokeLineJoin	- SVG strokeLineJoin property.
	/// 						strokeWidth			- [2] SVG strokeWidth property.
	/// Returns an SVG group <g> element.
	write(sText, nX, nY, nSize, oOpts = {}) {
		const nChrW = (CHR_WIDTH * nSize);
		const nSpcW = (KERN_WIDTH * nSize);
		const dRet = _createElement('g', {
			id: oOpts.id || (`grp${_nextGroupId++}`),
			fill: 'transparent',
			stroke: oOpts.stroke || _defaults.stroke,
			'stroke-linecap': oOpts.strokeLineCap || _defaults.strokeLineCap,
			'stroke-linejoin': oOpts.strokeLineJoin || _defaults.strokeLineJoin,
			'stroke-width': oOpts.strokeWidth || _defaults.strokeWidth,
			style: oOpts.hide ? 'opacity:0' : 'opacity:1'
		});

		_convertCharactersToArrays();

		sText.toUpperCase().split('').forEach(sChar => {
			const oChar = _characters[sChar];

			if (oChar) {
				let sPath = _resolvePath(oChar, nX, nY, nSize);

				dRet.append(_createElement('path', {d:sPath}));
				nX += (oChar.w ? oChar.w * nSize : nChrW) + nSpcW;
			} else {
				nX += nChrW;
			}
		});

		return dRet;
	},


	/// writeOn(dSvg, sText, nX, nY, nSize[, oOpts])
	/// Draws letters as paths onto a single SVG group <g> then appends that group to the SVG element provided.
	/// 	sText	- Text to write (converted to upper case).
	/// 	nX		- X coordinate for text.
	/// 	nY		- Y coordinate for text.
	/// 	nSize	- Size/height of text as a decimal percentage.
	/// 	oOpts	- [null] Additional options (see NeonText.write() for additional options):
	/// 						bg				- [false] If true, a background is created behind the text.
	/// 						centerX		- [false] If true, text is positioned relative to horz center of the SVG. Using an nX 
	/// 												value of 0 would result in the text being directly in the center horizontally.
	/// 						centerY		- [false] If true, text is positioned relative to vert center of the SVG. Using an nY
	/// 												value of 0 would result in the text being directly in the middle vertically.
	/// Returns an SVG group <g> element.
	writeOn(dSvg, sText, nX, nY, nSize, oOpts = {}) {
		let dRet;
		let nH = nSize * 100;
		let nW = _public.widthOf(sText, nSize);

		if (oOpts.centerX) {
			nX = (dSvg.viewBox.baseVal.width - nW) / 2 + nX;
		} else if (nX < 0) {
			nX = dSvg.viewBox.baseVal.width - nW + nX;
		}
		
		if (oOpts.centerY) {
			nY = (dSvg.viewBox.baseVal.height - nH) / 2 + nY;
		} else if (nY < 0) {
			nY = dSvg.viewBox.baseVal.height - nH + nY;
		}

		if (oOpts.bg) {
			dSvg.append(_createElement('rect', {x:nX, y:nY, width:nW, height:nH, stroke:'black', fill:'black'}));
		}

		dRet = _public.write(sText, nX, nY, nSize, oOpts);
		dSvg.append(dRet);

		return dRet;
	}


};

// INIT ================================================================================================================

export default _public;