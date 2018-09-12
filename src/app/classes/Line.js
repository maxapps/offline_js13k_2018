// Class which represents one of the lines.
// Each line is a single div element which is the same height as the stage. Even though its position is fixed, it 
// appears to scroll because there are gaps which move upward along it. These gaps are actually short div elements 
// which are the same color as the background.
// 
// Since the virtual lines may be thousands of pixels tall, memory usage is reduced by only attaching DOM elements to 
// the active gaps (i.e. those which are vertically positioned to appear on the stage). As gap positions change (always 
// moving up) a pool of DOM elements is constantly reused.

import resadj from '../utils/resadj'
import sounds from '../utils/sounds'

const GAP_BUFFER_SIZE = 5;
const ITEM_BUFFER_SIZE = 5;
const MAX_SPEED = 10;

let _layout, _lineHeight;


// _createElement(sClass)
function _createElement(sClass) {
	let dRet = document.createElement('div');

	dRet.className = sClass;

	return dRet;
}


// _itemObject(iY, iInfo, iGapH, dGap)
// Represents a gap or other item which noves up the line.
// 		iY		- Initial Y position for this gap. This value gets adjusted to scroll the gap upward.
// 		iInfo - For gaps, this is the height of the gap in iGapH units. For other items, this is an integer identifying 
// 						type of item.
// 		iGapH	- Calculated gap unit height from layout. All gaps are n units tall.
// 		dGap	- DOM element which will represent this gap. Note that the same element will likely represent several 
// 						different gaps but never more than one at the same time.
function _itemObject(iY, iInfo, iGapH, dGap) {
	this.active = false;
	this.top = iY * iGapH;
	this.height = iInfo * iGapH
	this.type = iInfo;
	this.info = iInfo & 0x0F;
	this.element = dGap;
	this.disposed = false;
}


export default class {

	// PRIVATE -----------------------------------------------------------------------------------------------------------
	
	// _initializeItems(aDefs, bGap)
	_initializeItems(aDefs, bGap) {
		let iBufferSize, iH, sClass, aBuffer, aItems, fElement;

		if (bGap) {
			iH = _layout.gapHeight;
			iBufferSize = GAP_BUFFER_SIZE;
			sClass = 'line-gap';
		} else {
			iH = _layout.itemSize;
			iBufferSize = ITEM_BUFFER_SIZE;
			sClass = 'line-item';
		}

		aBuffer = new Array(iBufferSize);
		for (let i = 0; i < iBufferSize; ++i) {
			aBuffer[i] = _createElement(sClass);
		}

		aItems = new Array(aDefs.length / 2);
		for (let i = 0, l = aDefs.length; i < l; i += 2) {
			let iIndex = i / 2;
			aItems[iIndex] = new _itemObject(aDefs[i], aDefs[i+1], iH, aBuffer[iIndex % iBufferSize]);
		}

		if (bGap) {
			this.gaps = aItems;
			this.firstGapIndex = 0;
		} else {
			this.items = aItems;
			this.firstItemIndex = 0;
		}
	}


	// _removeItem(oItem, bIndex)
	_removeItem(oItem, bIndex) {
		oItem.active = false;
		oItem.disposed = true;
		
		if (bIndex) {
			++this.firstItemIndex;		// don't process items which have scrolled off top of screen or no longer exist
		}

		this.element.removeChild(oItem.element);
		oItem.element.className = 'line-item';
	}


	// _updateGaps(bPlayer, mPlayer)
	// Update the gap positions so they scroll upward. The Y position of all gaps which have not scrolled off the top 
	// are updated but only those which can be seen have a DOM element attached.
	_updateGaps(bPlayer, mPlayer) {
		let bRet = false;
		let bSkip = false;
		let iIndex = this.firstGapIndex;
		let iLen = this.gaps.length;

		while (iIndex < iLen) {
			let oGap = this.gaps[iIndex++];

			oGap.top += this.speed;

			if (!bSkip) {		// all gaps must be moved but those still offscreen don't need visual update
				if (oGap.active) {		// an "active" gap is one with a DOM element already attached
					if (oGap.top + oGap.height < 0) {		// once a gap goes off top of screen it no longer needs to be active
						oGap.active = false;
						++this.firstGapIndex;		// no need to continue processing gaps which have scrolled off top of screen
						this.element.removeChild(oGap.element);
					} else {
						oGap.element.setAttribute('style', `top:${oGap.top}px;height:${oGap.height}px;`);
						if (bPlayer) {
							if (oGap.top <= mPlayer.bottom && oGap.top + oGap.height >= mPlayer.top) {
								bRet = true;
							}
						}
					}
				} else {		// must check if inactive gaps are about to come on screen and make active if needed
					if (oGap.top <= _lineHeight + MAX_SPEED) {
						oGap.active = true;
						oGap.element.setAttribute('style', `top:${oGap.top}px;height:${oGap.height}px;`);
						this.element.appendChild(oGap.element);
					} else {
						bSkip = true;
					}
				}
			}
		}

		return bRet;
	}


	// _updateItems(bPlayer, mPlayer)
	// Update the item positions so they scroll upward. The Y position of all items which have not scrolled off the top 
	// are updated but only those which can be seen have a DOM element attached.
	// Unlike the gaps, don't register a hit until the player is completely over the item.
	// Returns the integer item type if player hits an item or zero if no items hit.
	_updateItems(bPlayer, mPlayer) {
		const iItemH = _layout.itemSize;
		const iLen = this.items.length;
		let iRet = 0;
		let bSkip = false;
		let iIndex = this.firstItemIndex;

		while (iIndex < iLen) {
			let oItem = this.items[iIndex++];

			oItem.top += this.speed;

			if (!bSkip) {		// all items must be moved but those still offscreen don't need visual update
				if (oItem.active) {		// an "active" item is one with a DOM element already attached
					if (oItem.top + iItemH < 0) {		// once a item goes off top of screen it no longer needs to be active
						this._removeItem(oItem, true);
					} else {
						oItem.element.setAttribute('style', `${this.itemStyle};top:${oItem.top}px;`);
						if (bPlayer) {
							if (oItem.top <= mPlayer.top && oItem.top + _layout.itemSize >= mPlayer.top) {
								this._removeItem(oItem, false);
								iRet = oItem.type;
							}
						}
					}
				} else if (!oItem.disposed) {		// must check if inactive items are about to come on screen and make active if needed
					if (oItem.top <= _lineHeight + MAX_SPEED) {
						oItem.active = true;
						oItem.element.classList.add('line-item-' + oItem.type);
						if (oItem.type < 0x60) {			// change color to line n
							oItem.element.classList.add('line-color-' + oItem.info);
						}
						oItem.element.setAttribute('style', `${this.itemStyle};top:${oItem.top}px;`);
						this.element.appendChild(oItem.element);
					} else {
						bSkip = true;
					}
				}
			}
		}

		return iRet;
	}


	// PUBLIC ------------------------------------------------------------------------------------------------------------
	
	/// Constructor(dStage, oLine, iPos, oLayout)
	/// 	dStage	- DOM element representing the stage.
	/// 	oLine		- Object (from Levels.js) defining the line.
	/// 	iPos		- Position of this line (from left to right) as an integer (0 - # of lines) .
	/// 	oLayout	- Object with keys representing layout values calculated from stage size and level settings.
	constructor(dStage, oLine, iPos, oLayout) {
		let iX = oLayout.linePositions[iPos];
		
		_lineHeight = oLayout.stageHeight;
		_layout = oLayout;

		this.visible = true;
		this.visibleStyle = '';
		this.color = oLine.color;
		this.position = iPos;
		this.speed = resadj.adjustSpeed(dStage, oLine.speed) * -1;
		this.hasItems = oLine.hasOwnProperty('items');
		
		this.element = document.createElement('div');
		this.element.className = 'line line-color-' + this.color;
		this.element.setAttribute('style', `left:${iX}px;width:${oLayout.lineWidth}px;`);

		this._initializeItems(oLine.gaps, true);

		if (this.hasItems) {
			iX = Math.floor((oLayout.lineWidth - oLayout.itemSize) / 2);
			this.itemStyle = `left:${iX}px;width:${_layout.itemSize}px;height:${_layout.itemSize}px`;
			this._initializeItems(oLine.items, false);
		}

		this._updateGaps(false, null);
		this._updateItems(false, null);

		dStage.appendChild(this.element);
	}


	/// destroy()
	/// Dispose of HTML elements associated with the line.
	destroy() {
		this.element.remove();
		this.element.innerHTML = '';
		this.element = null;
	}


	/// toggle()
	/// Toggle visibility of the line on/off.
	toggle() {
		this.visible = !this.visible;

		if (this.visible) {
			this.element.setAttribute('style', this.visibleStyle);
			sounds.playSound(sounds.TOGGLE_ON);
		} else {
			this.visibleStyle = this.element.getAttribute('style');
			this.element.setAttribute('style', 'display:none;');
			sounds.playSound(sounds.TOGGLE_OFF);
		}
	}


	/// update(mPlayer)
	/// Updates movable items attached to the line (e.g. gaps, etc).
	/// 	mPlayer	- Instance of Player to use for collision detection.
	/// Returns (0) if player did not hit anything, (-1) if player hit a gap, and (n:type) if player hit an item.
	update(mPlayer) {
		let iRet = 0;
		let bPlayer = mPlayer.line === this.position;
		
		if (this.hasItems) {
			iRet = this._updateItems(bPlayer, mPlayer);
		}

		if (this._updateGaps(bPlayer, mPlayer)) iRet = iRet || -1;

		return iRet;
	}


}