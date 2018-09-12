// PRIVATE -------------------------------------------------------------------------------------------------------------

import SoundEffect from '../classes/SoundEffect'

const NOTES = [
	165, 175, 185, 196, 208, 220, 
	233, 247, 262, 277, 294, 311, 
	330, 349, 370, 392, 415, 440, 
	466, 494, 523, 554, 587, 622, 
	659, 698, 740, 784, 831, 880
];

// PUBLIC --------------------------------------------------------------------------------------------------------------

const CONST =  {
	HIT_GAP: {
	  frequencyValue: 60,
	  attack: 0,
	  decay: 0.2,
	  type: 'sawtooth',
	  volumeValue: 3,
	  panValue: 0,
	  pitchBendAmount: 10,
	  reverse: false,
	  randomValue: 0,
	  dissonance: 30,
	},

	NOTE: {
	  frequencyValue: 880,
	  attack: 0,
	  decay: 0.2,
	  type: 'sine',
	  volumeValue: .8,
	  panValue: -1,
	  pitchBendAmount: 0,
	  reverse: false,
	  randomValue: 0,
	  dissonance: 0,
	},

	TOGGLE_ON: {
	  frequencyValue: 280,
	  attack: 0,
	  decay: 0.2,
	  type: 'triangle',
	  volumeValue: .5,
	  panValue: 0,
	  pitchBendAmount: 20,
	  reverse: false,
	  randomValue: 0,
	  dissonance: 0,
	},

	TOGGLE_OFF: {
	  frequencyValue: 260,
	  attack: 0,
	  decay: 0.2,
	  type: 'triangle',
	  volumeValue: .5,
	  panValue: 0,
	  pitchBendAmount: 20,
	  reverse: true,
	  randomValue: 0,
	  dissonance: 0,
	}
};

let _public = {

	// playSound(oSound[, iLine[, iRow]])
	// Play the sound provided
	// 		iLine	- [-1] Index of line (0 - 5) if sound depends on which line the player is on.
	// 		iRow	- [undefined] Index of vertical position if sound depends on which pos the player is at.
	playSound(oSound, iLine = -1, iRow) {
		if (iLine >= 0) oSound.frequencyValue = NOTES[iRow * 5 + iLine];

		new SoundEffect(oSound).play();
	}


};


// INIT ================================================================================================================

// Add constants to _public
Object.keys(CONST).forEach(sKey => {
	Object.defineProperty(_public, sKey, {value:CONST[sKey], writable:false});
});

export default _public;