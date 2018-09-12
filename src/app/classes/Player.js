// Class which represents the player (ball on screen).

import sounds from '../utils/sounds'

const SIZE_FACTORS = [0.5, 0.88, 1, 2.1, 3.2];


// _calculateHeights(iGapH, aAdj)
function _calculateHeights(iGapH, aAdj) {
	return SIZE_FACTORS.map((iFactor, iNdx) => Math.floor(iGapH * (iFactor + aAdj[iNdx])));
}


// _calculateVerticalPositions(iStageH, iDefaultH)
function _calculateVerticalPositions(iStageH, iDefaultH) {
	return [iDefaultH, iDefaultH * 3, iDefaultH * 5, iDefaultH * 7, iDefaultH * 9];
}


export default class {

	// PRIVATE -----------------------------------------------------------------------------------------------------------
	
	/// _updatePosition()
	_updatePosition() {
		let iX = this.layout.linePositions[this.line] - Math.floor(this.height / 2);
		
		this.top = this.positions[this.position];
		this.bottom = this.top + this.height;
		this.element.setAttribute('style', `${this.styleFragment};left:${iX}px;top:${this.top}px;`);
		this.element.className = 'line-color-' + this.line;

		sounds.playSound(sounds.NOTE, this.line, this.position);
	}


	// PUBLIC ------------------------------------------------------------------------------------------------------------
	
	/// Constructor(dStage, iLine, iSize, oLayout)
	/// 	dStage	- DOM element representing the stage.
	/// 	iLine		- Index of starting line.
	/// 	iSize		- Starting size.
	/// 	oLayout	- Object with keys representing layout values calculated from stage size and level settings.
	constructor(dStage, oLevel, oLayout) {
		this.size = oLevel.playerSize;
		this.line = oLevel.startLine;
		this.position = oLevel.startRow;
		this.layout = oLayout;

		this.heights = _calculateHeights(oLayout.gapHeight, oLayout.sizeAdjustments);
		this.positions = _calculateVerticalPositions(oLayout.stageHeight, this.heights[2]);
		this.height = this.heights[this.size];

		this.element = document.createElement('div');
		this.element.setAttribute('id', 'divPlayer');
		this.styleFragment = `width:${this.height}px;height:${this.height}px`
		this._updatePosition();

		dStage.appendChild(this.element);
	}


	/// bump(iDir, aLines)
	/// Change player to a different line by moving 1 line left or right but hidden lines don't factor into the move. 
	/// Similar to the .changeLine() method but is called during update so hidden lines must be processed.
	/// 	iDir		- Direction to move (-1:Left, 1:Right).
	/// 	aLines	- Array of Line instances.
	bump(iDir, aLines) {
		let iLine = this.line + iDir;

		while (iLine >= 0 && iLine < aLines.length) {
			if (aLines[iLine].visible) {
				this.line = iLine;
				this._updatePosition();
				break;
			}

			iLine += iDir;
		}
	}


	/// changeLine(iDir, aLines)
	/// Change player to a different line by moving 1 line left or right. Player cannot move to or through a hidden line.
	/// 	iDir	- Direction to move (-1:Left, 1:Right).
	/// 	aLines	- Array of Line instances.
	/// Returns true if the player switched lines, false if not.
	changeLine(iDir, aLines) {
		let iLine = this.line + iDir;
		let bRet = iLine >= 0 && iLine < aLines.length && aLines[iLine].visible;

		if (bRet) {
			this.line = iLine;
			this._updatePosition();
		}

		return bRet;
	}


	/// destroy()
	/// Dispose of HTML elements associated with the player.
	destroy() {
		if (this.element) {
			this.element.remove();
			this.element = null;
		}
	}


	/// changeSize(iDir)
	/// Change player size.
	/// 	iDir	- Type of change (-1: smaller,  1: larger).
	changeSize(iDir) {
		let iSize = this.size + iDir;

		if (iSize >= 0 && iSize < SIZE_FACTORS.length) {
			this.size = iSize;
			this.height = this.heights[iSize];
			this.styleFragment = `width:${this.height}px;height:${this.height}px`
			this._updatePosition();
		}
	}


	/// changeVertical(iDir)
	/// Change vertical position.
	/// 	iDir	- Direction to change (-4:Up 4, -3:Up 3, -2:Up 2, -1:Up 1, 1:Down 1, 2:Down 2, 3:Down 3, 4:Down 4).
	changeVertical(iDir) {
		this.position = Math.min(4, Math.max(0, this.position + iDir));
		this._updatePosition();
	}


	/// moveToLine(iLine)
	/// Move player to a specific line.
	/// 	iLine	- Line to move to.
	moveToLine(iLine) {
		this.line = iLine;
		this._updatePosition();
	}


}