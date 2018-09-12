// Provides an object with methods for interfacing with the main menu (level selection, etc) and message area.

// PRIVATE -------------------------------------------------------------------------------------------------------------

import levels from './levels'
import neontext from './utils/neontext'
import resadj from './utils/resadj'
import utils from './utils/utils'

const GROUP_LEVEL_ID = 'grpLevel';
const GROUP_LEVEL_SIZE = .5;

const GROUP_TITLE_ID = 'grpTitle';
const GROUP_TITLE_SIZE = .25;

const GROUP_MSG1_SIZE = .7;
const GROUP_MSG2_SIZE = .4;
const GROUP_OTHER_SIZE = .15;

const _levelPlusColors = ['#66FF66', '#0066FF', '#FFFF66', '#FD0E38', '#FF6038'];

let _busy,
		_hidden,
		_isTouch,
		_level,
		_needsRedraw,
		_svgMenu,
		_svgMsg,
		_useNeonLines = false;


// _drawControlMenu()
function _drawControlMenu() {
	if (_isTouch) {
		neontext.writeOn(_svgMenu, 'LEFT = PREV LEVEL', 20, -40, GROUP_OTHER_SIZE, {strokeWidth:1});
		neontext.writeOn(_svgMenu, 'NEXT LEVEL = RIGHT', -20, -40, GROUP_OTHER_SIZE, {strokeWidth:1});
		neontext.writeOn(_svgMenu, 'MIDDLE = PLAY', 0, -10, GROUP_OTHER_SIZE, {centerX:true, strokeWidth:1});
	} else {
		neontext.writeOn(_svgMenu, '< = PREV LEVEL', 20, -40, GROUP_OTHER_SIZE, {strokeWidth:1});
		neontext.writeOn(_svgMenu, 'NEXT LEVEL = >', -20, -40, GROUP_OTHER_SIZE, {strokeWidth:1});
		neontext.writeOn(_svgMenu, 'SPACE = PLAY', 0, -10, GROUP_OTHER_SIZE, {centerX:true, strokeWidth:1});
	}

	_drawPreviewText();
}


// _drawMainMenu()
function _drawMainMenu() {
	levels.getLevel(_level);
	neontext.default('stroke', _levelPlusColors[levels.levelPlus % _levelPlusColors.length]);

	_writeLevelToMenu(false);
	_drawControlMenu();
	_drawMainMenuOther();
}


// _drawMainMenuOther()
function _drawMainMenuOther() {
	if (!_isTouch) {
		let sMsg;

		if (levels.levelPlusHigh) {
			sMsg = 'F1 = Normal';
			for (let i = 0; i < levels.levelPlusHigh; ++i) {
				sMsg += `, F${i + 2} = X${i + 2}`;
			}
		} else {
			sMsg = `Esc = ${_useNeonLines ? 'Remove neon' : 'Restore neon'}`;
		}

		neontext.writeOn(_svgMenu, sMsg, 0, -70, GROUP_OTHER_SIZE, {id:'grpOther', centerX:true, strokeWidth:1});
	}
}


// _drawPreviewText()
function _drawPreviewText() {
	_showMessages(`${_isTouch ? 'Top' : 'P'} = Toggle Preview`, '');
}


// _getLevelText(oLevel)
function _getLevelText(oLevel) {
	let sLevel = 'LEVEL ' + oLevel.number;
	return levels.levelPlus ? `${sLevel}+${levels.levelPlus}` : sLevel;
}


// _removeText(aItems)
// Remove SVG group <g> representing text from their SVG parent using a fade-out animation.
// 		aItems	- Array of SVG groups <g> or string IDs (of groups) to remove.
// Returns a promise which is resolved when the item is removed.
function _removeText(aItems) {
	const aElements = aItems.map(vItem => typeof vItem === 'string' ? document.getElementById(vItem) : vItem);
	const pRet = utils.fadeOut(aElements).then(() => {
		aElements.forEach(dElement => dElement.remove());
	});

	return pRet;
}


// _showMessages(sLine1, sLine2)
function _showMessages(sLine1, sLine2) {
	utils.clearSvg(_svgMsg);

	if (resadj.isSmallScreen) {
		neontext.writeOn(_svgMsg, sLine1, 0, -84, GROUP_MSG1_SIZE + .15, {bg:true, centerX:true, strokeWidth:4});
		neontext.writeOn(_svgMsg, sLine2, 0, -4, GROUP_MSG2_SIZE + .1, {bg:true, centerX:true, strokeWidth:4});
	} else {
		neontext.writeOn(_svgMsg, sLine1, 0, -80, GROUP_MSG1_SIZE, {bg:true, centerX:true});
		neontext.writeOn(_svgMsg, sLine2, 0, -4, GROUP_MSG2_SIZE, {bg:true, centerX:true});
	}
}


// _writeLevelToMenu(bHide)
function _writeLevelToMenu(bHide) {
	const oLevel = levels.getLevel(_level);

	return [
		neontext.writeOn(_svgMenu, 
				_getLevelText(oLevel), 0, -80, GROUP_LEVEL_SIZE, {id:GROUP_LEVEL_ID, centerX:true, centerY:true, hide:bHide}),
		neontext.writeOn(_svgMenu,
				oLevel.title, 0, 0, GROUP_TITLE_SIZE, {id:GROUP_TITLE_ID, centerX:true, centerY:true, hide:bHide})
	];
}


// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

	/// isTouch
	/// Should be set to true if player touches the screen, false if a key is pressed.
	get isTouch() {
		return _isTouch;
	},
	set isTouch(bVal) {
		if (_isTouch != bVal) {
			_isTouch = bVal;
			utils.clearSvg(_svgMenu);
			_drawMainMenu();
		}
	},


	/// changeLevel(iDir)
	/// Changes to the previous or next level.
	/// 	iDir	- Direction to change (-1) for previous, (1) for next.
	changeLevel(iDir) {
		let iLevel = (_level + iDir) % levels.length;

		if (!_busy && iLevel >= 0 && iLevel <= levels.levelHigh) {
			_busy = true;
			_level = iLevel;

			_removeText([GROUP_LEVEL_ID, GROUP_TITLE_ID]).then(() => {
				const aGroups = _writeLevelToMenu(true);
				_drawPreviewText();
				utils.fadeIn(aGroups).then(() => _busy = false);
			});
		}
	},


	/// getLevel()
	/// Get information for the current level.
	/// Returns an object (from levels.js) representing the current level {number, playerSize, startLine, lines, etc}.
	getLevel() {
		return levels.getLevel(_level);
	},


	/// hide()
	/// Hides the main menu with a fade-out effect.
	/// Returns a promise which is resolved when the menu is hidden.
	hide() {
		if (_hidden) {
			return Promise.resolve();
		} else {
			_hidden = true;
			return utils.fadeOut(_svgMenu, 0.1);
		}
	},


	/// init(dMenu, dMessage)
	/// Initializes the menu.
	/// 	dMenu			- SVG element representing the menu area.
	/// 	dMessage	- SVG element representing the message area.
	init(dMenu, dMessage) {
		const iLevel = levels.levelHigh;

		_isTouch = resadj.isTouchScreen;
		_level = iLevel;
		_svgMsg = dMessage;
		_svgMenu = dMenu;

		_drawMainMenu();
	},


	/// nextLevel()
	/// Moves to next level and displays level info in messages area.
	/// Returns an object (from levels.js) representing the new level {number, playerSize, startLine, lines, etc}.
	nextLevel() {
		return new Promise(fResolve => {
			let oLevel;
			let iLevel = _level + 1;

			if (iLevel === levels.length && levels.levelPlus === levels.levelPlusHigh) {
				_level = levels.levelHigh = iLevel;
				neontext.default('stroke', _levelPlusColors[levels.levelPlus % _levelPlusColors.length]);
				_showMessages('All levels completed', 'Time to go faster');
				setTimeout(() => {
					_needsRedraw = true;
					oLevel = levels.getLevel(iLevel);
					_showMessages(_getLevelText(oLevel), oLevel.title);
					fResolve(oLevel)
				}, 3000);
			} else {
				_level = levels.levelHigh = iLevel;
				oLevel = levels.getLevel(iLevel);
				_showMessages(_getLevelText(oLevel), oLevel.title);
				fResolve(oLevel)
			}
		});
	},


	/// setLevelPlus(iPlus)
	/// Increases the level plus value if it is allowed.
	/// 	iPlus	- Requested plus value.
	setLevelPlus(iPlus) {
		const iOld = levels.levelPlus;

		levels.levelPlus = iPlus;

		if (levels.levelPlus !== iOld) {
			utils.clearSvg(_svgMenu);
			_drawMainMenu();
		}
	},


	/// show()
	/// Displays the main menu with a fade-in effect.
	show() {
		let aGroups;

		_hidden = false;
		utils.clearSvg(_svgMsg);

		if (_needsRedraw) {
			utils.clearSvg(_svgMenu);
			_needsRedraw = false;
			_drawMainMenu();
		} else {
			document.getElementById(GROUP_LEVEL_ID).remove();
			document.getElementById(GROUP_TITLE_ID).remove();
		}

		_svgMenu.setAttribute('style', 'display:initial');
		aGroups = _writeLevelToMenu(true);
		utils.fadeIn(aGroups).then(() => {
			_busy = false;
			_drawPreviewText();
		});
	},


	/// showGameOverMessage()
	/// Displays "game over" in the messages area.
	showGameOverMessage() {
		_showMessages('- game over -', _isTouch ? '[touch middle to continue]' : '[press space to continue]');
	},


	/// showPauseMessage(bShow)
	/// Displays pause message in messages area.
	showPauseMessage(bShow) {
		if (bShow) {
			_showMessages('- paused -', '[press space to continue]');
		} else {
			utils.clearSvg(_svgMsg);
		}
	},


	/// toggleNeonLines()
	/// Toggle "neon" lines on/off. Scroll might be smoother with it off.
	toggleNeonLines() {
		const mRules = document.styleSheets[0].cssRules;
		const dOther = document.getElementById('grpOther');

		_useNeonLines = !_useNeonLines;

		if (dOther) {
			dOther.remove();
		}

		_drawMainMenuOther();

		for (let i = 0, l = mRules.length; i < l; ++i) {
			const mRule = mRules[i];

			if (mRule.selectorText.indexOf('.line-color-') >= 0) {
				if (_useNeonLines) {
					const sBG = mRule.style.getPropertyValue('background-color');
					mRule.style.setProperty('box-shadow', `0px 0px 24px ${sBG}, 0px 0px 24px ${sBG}, 0px 0px 24px ${sBG}`);
				} else {
					mRule.style.removeProperty('box-shadow');
				}
			}
		}
	}


};

// INIT ================================================================================================================

export default _public;