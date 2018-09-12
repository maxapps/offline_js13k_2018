// Provides an object which manages display of level previews.

// PRIVATE -------------------------------------------------------------------------------------------------------------

import utils from './utils/utils'

const _lineColors = ['#0066FF', '#FD0E38', '#66FF66', '#FF00CC', '#FFFF66', '#FF6038', '#181818'];


// _addGaps(dLine, aGaps, oLayout)
function _addGaps(dLine, aGaps, oLayout) {
	for (let i = 0, l = aGaps.length; i < l; i += 2) {
		const iY = aGaps[i] * oLayout.gapHeight;
		const iH = aGaps[i+1] * oLayout.gapHeight;
		const dGap = _createElement('div', {
			class: 'line-gap',
			style: `top:${iY}px;height:${iH}px;`
		});

		dLine.appendChild(dGap);
	}
}


// _addItems(dLine, aItems, iLine, oLayout)
function _addItems(dLine, aItems, iLine, oLayout) {
	for (let i = 0, l = aItems.length; i < l; i += 2) {
		const iX = Math.floor((oLayout.lineWidth - oLayout.itemSize) / 2);
		const iY = aItems[i] * oLayout.itemSize;
		const iH = oLayout.itemSize;
		const dItem = _createElement('div', {
			class: `line-item line-item-${aItems[i+1]} line-color-${iLine}`,
			style: `left:${iX}px;width:${oLayout.itemSize}px;height:${oLayout.itemSize}px;top:${iY}px;`
		});

		dLine.appendChild(dItem);
	}
}


// _createElement(sTag[, oAttr])
// Creates an HTML element of the specified tag type and adds optional attributes.
function _createElement(sTag, oAttr) {
	let dRet = document.createElement(sTag);

	if (oAttr) {
		Object.keys(oAttr).forEach(sAttr => {
			dRet.setAttribute(sAttr, oAttr[sAttr])
		});
	}

	return dRet;
}


// _createLine(oLine, iIndex, oLayout, bTouch)
function _createLine(oLine, iIndex, oLayout, bTouch) {
	const iX = oLayout.linePositions[iIndex] * (bTouch ? 1 : 2) + 25;
	const iH = oLine.gaps[oLine.gaps.length - 2] * oLayout.gapHeight + oLine.gaps[oLine.gaps.length - 1] * oLayout.gapHeight;
	const dRet = _createElement('div', {
		class: `line line-color-${iIndex}`,
		style: `height:${iH}px;left:${iX}px;width:${oLayout.lineWidth}px;`
	});

	_addGaps(dRet, oLine.gaps, oLayout);
	_addItems(dRet, oLine.items, iIndex, oLayout);

	return dRet;
}


// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

	/// hide()
	/// Hide the preview area.
	hide() {
		const dPreview = document.getElementById('divPreview');

		utils.fadeOut(dPreview);
	},


	/// show(oLevel, oLayout, bTouch)
	/// Show the preview area and generate preview for the level provided.
	/// 	oLevel	- Object with information about the level.
	/// 	oLayout	- Object with keys representing layout values calculated from preview area size and level settings.
	/// 	bTouch	- True if device appears to be touch enabled.
	show(oLevel, oLayout, bTouch) {
		const dPreview = document.getElementById('divPreview');

		oLevel.lines.forEach((oLine, iNdx) => {
			dPreview.appendChild(_createLine(oLine, iNdx, oLayout, bTouch));
		});

		dPreview.setAttribute('style', 'display:block;opacity:1');
	}


}


// INIT ================================================================================================================

export default _public;