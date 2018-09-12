// Provides an object which adjusts certain game parameters based on the screen resolution.

// PRIVATE -------------------------------------------------------------------------------------------------------------

const STAGE_RATIO = .564;
const STAGE_RATIO_INVERSE = 1.773;
const VERT_BASE = 620;


// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

	/// isSmallScreen
	/// True if operating on a "small" screen (i.e. width <= 800 OR height <= 600).
	get isSmallScreen() {
		return window.innerWidth <= 800 || window.innerHeight <= 600;
	},


	/// isTouchScreen
	/// True if device appears to have a touch screen.
	get isTouchScreen() {
		return 'ontouchstart' in document.documentElement;
	},


	/// adjustSpeed(dStage, nSpeed)
	/// Adjust the line scrolling speed based on differences in vertical resolution.
	/// 	dStage	- DOM element representing the stage.
	/// 	nSpeed	- Speed to adjust.
	/// Returns a numeric speed which is adjusted for the current vertical resolution.
	adjustSpeed(dStage, nSpeed) {
		return Math.max((nSpeed * dStage.clientHeight / VERT_BASE), 1.5);
	},


	/// adjustWidthHeightRatio()
	/// Adjust the width/height ratio if it's less than the default minimum of .546.
	adjustWidthHeightRatio() {
		const iWinH = window.innerHeight;
		const nTgtH = window.innerWidth * STAGE_RATIO;
		const mRules = document.styleSheets[0].cssRules;

		for (let i = 0, l = mRules.length; i < l; ++i) {
			const mRule = mRules[i];

			if (mRule.selectorText === '#divStage') {
				if (nTgtH <= iWinH * .9) {		// Adjust height to width
					mRule.style.setProperty('height', nTgtH + 'px');
					mRule.style.setProperty('width', '90vw');
				} else {											// Adjust width to height
					mRule.style.setProperty('height', '90vh');
					mRule.style.setProperty('width', (iWinH * .9 * STAGE_RATIO_INVERSE) + 'px');
				}

				break;
			}
		}
	}


};

export default _public;