// Provides an object with global utility methods and constants.

// PRIVATE -------------------------------------------------------------------------------------------------------------

const DEFAULT_FADE_STEP = 0.1;
const FADE_INTERVAL = 25;

// PUBLIC --------------------------------------------------------------------------------------------------------------

const CONST = {
	DEBUG: false,
	VERSION: '1.2.1',
};

let _public = {

	/// clearSvg(dSvg)
	/// Removes all children from an SVG DOM element.
	clearSvg(dSvg) {
		while (dSvg.lastChild) {
			dSvg.removeChild(dSvg.lastChild);
		}
	},


	/// fadeIn(vElements[, nStep])
	/// Uses the style attribute to fade an element in using its opacity.
	/// 	vElements	- Element or array of elements to fade in.
	/// 	nStep			- [0.1] How quickly to change the opacity.
	fadeIn(vElements, nStep = 0.1) {
		const aElements = Array.isArray(vElements) ? vElements : [vElements];

		return new Promise(fResolve => {
			let iOpacity = 0;

			const iInterval = setInterval(() => {
				iOpacity += nStep;
				aElements.forEach(dElement => dElement.setAttribute('style', 'opacity:' + iOpacity));
				if (iOpacity >= 1) {
					clearInterval(iInterval);
					fResolve();
				}
			}, FADE_INTERVAL);
		});
	},


	/// fadeOut(vElements[, nStep])
	/// Uses the style attribute to fade an element out using its opacity.
	/// 	vElements	- Element or array of elements to fade out.
	/// 	nStep			- [0.1] How quickly to change the opacity.
	fadeOut(vElements, nStep = 0.1) {
		const aElements = Array.isArray(vElements) ? vElements : [vElements];

		return new Promise(fResolve => {
			let iOpacity = 1;

			const iInterval = setInterval(() => {
				iOpacity -= nStep;
				aElements.forEach(dElement => dElement.setAttribute('style', 'opacity:' + iOpacity));
				if (iOpacity <= 0) {
					clearInterval(iInterval);
					aElements.forEach(dElement => dElement.setAttribute('style', 'display:none'));;
					fResolve();
				}
			}, FADE_INTERVAL);
		});
	},


	/// getLocalInt(sKey, iDefault)
	/// Gets an integer value from localStorage.
	/// 	sKey			- Key of value to retrieve.
	/// 	iDefault	- Default value to return if key does not exist.
	/// Returns integer value.
	getLocalInt(sKey, iDefault) {
		let sVal = localStorage.getItem(sKey);
		return sVal === null ? iDefault : parseInt(sVal);
	},


	/// setLocalInt(sKey, iVal)
	/// Sets an integer value in localStorage.
	/// 	sKey	- Key to set.
	/// 	iVal	- Value to set.
	setLocalInt(sKey, iVal) {
		localStorage.setItem(sKey, iVal);
	}


}


// INIT ================================================================================================================

// Add constants to _public
Object.keys(CONST).forEach(sKey => {
	Object.defineProperty(_public, sKey, {value:CONST[sKey], writable:false});
});

// console.log('Offline vs' + CONST.VERSION);

export default _public;