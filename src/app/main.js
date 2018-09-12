import engine from './engine'
import neontext from './utils/neontext'
import resadj from './utils/resadj'
import utils from './utils/utils'

let _svgMenu;

// _loadGame()
function _loadGame() {
	resadj.adjustWidthHeightRatio();
	engine.init(
			document.getElementById('divStage'), document.getElementById('svgMenu'), document.getElementById('svgMsg'));
}


// _handleResize(oEvt)
function _handleResize(oEvt) {
	window.removeEventListener('resize', _handleResize);
	utils.clearSvg(_svgMenu);
	_svgMenu = null;
	_loadGame()
}


// If height greater than width, display message indicating screen needs to be rotated.
if (window.innerHeight > window.innerWidth) {
	_svgMenu = document.getElementById('svgMenu');
	neontext.writeOn(_svgMenu, 'rotate', 0, -40, .5, {centerX:true, centerY:true});
	neontext.writeOn(_svgMenu, 'screen', 0, 40, .5, {centerX:true, centerY:true});
	window.addEventListener('resize', _handleResize);
} else {
	_loadGame();
}
