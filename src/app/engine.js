// Provides an object which ties all game elements togther and controls the game loop.
// Once the engine is initialized, the stage component's update() method is called every update cycle of the game loop.

// PRIVATE -------------------------------------------------------------------------------------------------------------

import Line from './classes/Line'
import Player from './classes/Player'
import loop from './loop'
import menu from './menu'
import preview from './preview'
import sounds from './utils/sounds'
import utils from './utils/utils'

const PAUSE_GAME_OVER = 1;
const PAUSE_LEVEL = 2;
const PAUSE_PLAYER = 3;

const LINE_WIDTH = 4;
const VERT_RESOLUTION = 11;

const KEY_ESC = 27;
const KEY_F1 = 112;
const KEY_F6 = 117;
const KEY_LEFT = 37;
const KEY_P = 80;
const KEY_RIGHT = 39;
const KEY_SPC = 32;

// Functions called when game elements are hit by player.
const _hitActions = {
	16: iVal => _player.moveToLine(iVal),										// Teleport player to line [n]
	32: iVal => _lines[iVal].toggle(),											// Toggle display of line [n]
	96: iVal => _player.bump(iVal - 1, _lines),							// Bump player 1 (visible) line left:-1 or right:1
	112: iVal => _player.changeVertical(iVal - 4),					// Move player up or down [n] positions
	128: iVal => _player.changeSize(iVal - 1),							// Change player size smaller:-1 or bigger:1
	240: iVal => _endLevel()																// Proceed to next level
};

let	_lastHit,								// Value of last ball hit. Needed to delay action until lines have scrolled up a bit
		_lastKeyDownTime = 0,		// Time of last keydown event to prevent double key taps.
		_layout,								// Object with layout information based on current screen size.
		_level,									// Object representing current level
		_lines,									// Array containing instances of Line
		_linesLength,						// Length of lnies array
		_needRestart,						// True if game needs to be restarted
		_paused,								// True if game is paused
		_pauses,								// Number of pauses remaining
		_player,								// Object representing player
		_previewing,						// True when preview is being displayed
		_touchLeftX,						// Touches left of this position same as pressing < key
		_touchRightX,						// Touches right of this position same as pressing > key
		_stage,									// DOM element for the stage which contains the scrolling canvas
		_started,								// Has the game started?
		_waitForAction;					// Used to delay action caused by player hitting a ball so lines can scroll up first


// _Layout(oLevel, nStageW, nStageH)
// Returns an object with layout info.
function _Layout(oLevel, nStageW, nStageH) {
	const iLen = oLevel.lines.length;
	const iLaneW = Math.min(Math.floor(nStageW / (iLen + 1)), 150);
	const iLineW = LINE_WIDTH;
	const iOff = Math.floor((nStageW -  (iLaneW + iLineW) * (iLen + 1)) / 2);
	const aPositions = [];

	for (let i = 1; i <= iLen; ++i) {
		aPositions.push(iLaneW * i - Math.floor(iLineW / 2) + iOff);
	}

	this.gapHeight = Math.floor(nStageH / VERT_RESOLUTION),
	this.itemSize = Math.floor(nStageH / VERT_RESOLUTION),
	this.lineWidth = LINE_WIDTH,
	this.linePositions = aPositions,
	this.sizeAdjustments = oLevel.sizeAdjustments || [0, 0, 0, 0, 0],
	this.stageHeight = nStageH,
	this.stageWidth = nStageW
}


// _drawPauses(iCnt)
function _drawPauses(iCnt) {
	let sHtml = '';
	const dPauses = document.getElementById('divPauses');

	_pauses = iCnt < 0 ? _pauses += iCnt : iCnt;

	for (let i = 0; i < _pauses; ++i) {
		sHtml += '<div class="pause-symbol"></div>';
	}

	dPauses.innerHTML = sHtml;
}


// _endLevel()
function _endLevel() {
	_stop();

	utils.fadeOut(_stage).then(() => {
		menu.nextLevel().then(oLevel => _startLevel(oLevel, PAUSE_LEVEL));
	});

	return true;
}


// _handleKeyDown(oEvt)
function _handleKeyDown(oEvt) {
	const iTime = Date.now();
	const iCode = oEvt.keyCode;

	if (oEvt.preventDefault) {
		oEvt.preventDefault()
		menu.isTouch = false;
	}

	if (_previewing) {
		if (iCode === KEY_P) {
			_previewing = false;
			preview.hide();
		}
	} else if (_started) {
		if (_paused) {
			if (iCode === KEY_SPC) {
				_pause(false);
			}
		} else if (_waitForAction > 99999) {
			if (iCode === KEY_LEFT) {
				_player.changeLine(-1, _lines);
			} else if (iCode === KEY_RIGHT) {
				_player.changeLine(1, _lines);
			} else if (iCode === KEY_SPC && _pauses > 0) {
				_pause(true, PAUSE_PLAYER);
				_drawPauses(-1);
			}
		}
	} else if (iTime - _lastKeyDownTime > 400) {
		_lastKeyDownTime = iTime;
	
		if (iCode === KEY_LEFT || iCode === KEY_RIGHT) {
			if (!_needRestart) {
				menu.changeLevel(iCode - 38);
			}
		} else if (iCode === KEY_SPC) {
			if (_needRestart) {
				_restart();
			} else {
				_startLevel(menu.getLevel(), PAUSE_PLAYER);
			}
		} else if (iCode === KEY_ESC) {
			menu.toggleNeonLines();
		} else if (iCode >= KEY_F1 && iCode <= KEY_F6) {
			menu.setLevelPlus(iCode - KEY_F1);
		} else if (iCode === KEY_P) {
			const oLevel = menu.getLevel();
			_previewing = true;
			preview.show(oLevel, new _Layout(oLevel, 300, 500), menu.isTouch);
		}
	}
}


// _handleTouchEnd(oEvt)
function _handleTouchEnd(oEvt) {
	const iX = oEvt.changedTouches[0].pageX;
	const iY = oEvt.changedTouches[0].pageY;

	menu.isTouch = true;

	_handleKeyDown({
		keyCode: iY <= 30 ? KEY_P : (iX < _touchLeftX ? KEY_LEFT : (iX > _touchRightX ? KEY_RIGHT : KEY_SPC)),
	});
}


// _pause(bPause[, iReason])
// Pauses or unpauses the game loop.
// 		bPause	- Pauses if true, unpauses if false.
// 		iReason	- [null] Reason game was paused.
function _pause(bPause, iReason) {
	_paused = bPause;

	if (bPause) {
		loop.stop();

		if (iReason === PAUSE_PLAYER) {
			menu.showPauseMessage(true);
		} else if (iReason === PAUSE_GAME_OVER) {
			menu.showGameOverMessage();
			_started = false;
			_needRestart = true;
		}
	} else {
		menu.showPauseMessage(false);
		loop.start();
	}
}


// _restart()
function _restart() {
	_stop();
	_stage.setAttribute('style', 'display:none');
	_needRestart = false;
	menu.show();
}


// _startLevel(oLevel, iReason)
function _startLevel(oLevel, iReason) {
	menu.hide().then(() => {
		_lastHit = 0;
		_drawPauses(3);
		_stage.setAttribute('style', 'opacity:0');

		utils.fadeIn(_stage).then(() => {
			_waitForAction = Number.MAX_SAFE_INTEGER;
			_level = oLevel;
			_layout = new _Layout(_level, _stage.clientWidth, _stage.clientHeight);
			_lines = _level.lines.map((oLine, iNdx) => new Line(_stage, oLine, iNdx, _layout));
			_linesLength = _lines.length;
			_player = new Player(_stage, _level, _layout);
			_started = true;

			_pause(true, iReason);
		});
	});
}


// _stop()
function _stop() {
	loop.stop();
	_started = false;
	_player.destroy();
	_lines.forEach(mLine => mLine.destroy());
}


// _update(nDelta)
function _update(nDelta) {
	for (let i = 0, l = _linesLength; i < l; ++i) {
		let iHit = _lines[i].update(_player);

		if (--_waitForAction <= 0) {
			let iVal = _lastHit & 0x0F;
			if (_hitActions[_lastHit - iVal](iVal)) break;
			_lastHit = 0;
			_waitForAction = Number.MAX_SAFE_INTEGER;
		} else if (iHit > 0) {
			_lastHit = iHit;
			_waitForAction = 2;
		} else if (iHit < 0) {
			_pause(true, PAUSE_GAME_OVER);
			sounds.playSound(sounds.HIT_GAP);
		}
	}
}


// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

	// init(dStage, dMenu, dMsg)
	// Initializes the game engine.
	// 		dStage	- DOM element representing the game stage.
	// 		dMenu		- DOM element representing the SVG menu area.
	// 		dMsg		- Dom element representing the SVG message area.
	init(dStage, dMenu, dMsg) {
		_stage = dStage;

		_touchLeftX = Math.floor(window.innerWidth / 3);
		_touchRightX = _touchLeftX * 2;

		menu.init(dMenu, dMsg);
		loop.setDraw(_update);

		document.addEventListener('keydown', _handleKeyDown);
		document.addEventListener('touchend', _handleTouchEnd);
	}


};

export default _public;