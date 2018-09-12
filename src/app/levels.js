// Object whcih provides an interface for getting data about game levels.
// 
// ITEMS:
// 		0x1[n]		16		Teleport player to line [n].
// 		0x2[n]		32		Toggle line [n] on/off.
// 		0x3[n]		48  	reserved
// 		0x4[n]		64		reserved
// 		0x5[n]		80		reserved
// 		0x6[n]		96		Bump player left (0) or right (2) one line.
// 		0x7[n]		112		Move player up 2(112), up 1(113), down 1(115), or down 2(116).
//		0x7[n]		112		Move player up/down:  112:Up4,  113:Up3,  114:Up2,  115:Up1,  117:Dn1,  118:Dn2,  119:Dn3,  120:D4
// 		0x8[n]		128		Make player smaller (0) or bigger (2).
// 		0x9[n]		144 	reserved
// 		0xA[n]		160 	reserved
// 		0xB[n]		176 	reserved
// 		0xC[n]		192 	reserved
// 		0xD[n]  	208 	reserved
// 		0xE[n]		224 	reserved
// 		0xF[n]		240		End of level ([n] required but not currently used).

// PRIVATE -------------------------------------------------------------------------------------------------------------

import utils from './utils/utils'

const LOCAL_LEVEL_HIGH = 'level-high';
const LOCAL_LEVEL_PLUS = 'level-plus';
const LOCAL_LEVEL_PLUS_HIGH = 'level-plus-high';

const _speeds = [2, 3, 4.5, 6, 8, 11, 15, 20, 30];

const _levels = [
	{
		number: 1,
		playerSize: 2,										// Initial size of player (0..4)
		startLine: 1,                     // Index starting line # (0 ... 5)
		startRow: 1,                      // Index of starting position (0:top ... 5:bottom)
		title: 'Just getting started',
		lines: [
			{
				color: 0,
				speed: 2,
				gaps: [0,9,  11,1,  18,2,  27,2,  33,1,  40,2,  48,12],
				items: []
			},
			{
				color: 1,
				speed: 2,
				gaps: [0,3,  9,1,  15,1,  22,1,  24,1,  30,2,  36,2,  41,2,  50,10],
				items:[45,255]
			},
			{
				color: 2,
				speed: 2,
				gaps: [0,6,  12,2,  17,2,  26,2,  38,1,  45,15],
				items: []
			}
		]
	},

	{
		number: 2,
		playerSize: 2,
		startLine: 1,
		startRow: 1,
		title: 'Teleporting is cool',
		lines: [
			{
				color: 0,
				speed: 2,
				gaps: [0,6,  18,1,  23,1,  27,2,  37,1,  43,2,  50,10],
				items: [10,18,  36,18]
			},
			{
				color: 1,
				speed: 2,
				gaps: [8,3,  14,2,  21,4,  32,2,  40,1,  44,2,  50,10],
				items:[49,255]
			},
			{
				color: 2,
				speed: 2,
				gaps: [0,6,  8,1,  13,1,  17,2,  27,1,  34,1,  36,3,  48,12],
				items: [25,16]
			}
		]
	},

	{
		number: 3,
		playerSize: 2,
    startLine: 1,
    startRow: 0,
    title: 'Ups and Downs Too',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [3,3,13,1,19,2,31,1,37,2,42,9],
        items: [24,118],
      },
      {
        color: 1,
        speed: 2,
        gaps: [8,3,16,4,23,2,27,1,34,2,42,9],
        items: [33,112,40,255],
      },
      {
        color: 2,
        speed: 2,
        gaps: [5,2,11,2,22,3,29,4,38,2,42,9],
        items: [10,120],
      },
      {
        color: 3,
        speed: 2,
        gaps: [9,2,17,3,25,2,35,1,38,1,42,9],
        items: [],
      }
    ]
	},

	{
		number: 4,
		playerSize: 2,
	  startLine: 2,
	  startRow: 0,
	  title: 'It\'s all Good',
	  lines: [
	    {
	      color: 0,
	      speed: 2,
	      gaps: [3,2,  6,1,  9,1,  17,3,  22,1,  27,2,  41,4,  50,3,  62,1,  71,1,  76,9],
	      items: [21,120,  32,19,  61,112]
	    },
	    {
	    	color: 1,
	    	speed: 2,
	    	gaps: [9,2,  12,3,  24,1,  30,2,  36,1,  38,1,  42,1,  47,1,  51,1,  57,1,  65,4,  73,1,  76,9],
	    	items: [20,117]
	    },
	    {
	    	color: 2,
	    	speed: 2,
	    	gaps: [5,3,  16,3,  27,1,  32,1,  38,2,  45,1,  48,1,  53,2,  58,2,  61,3,  70,2,  76,9],
	    	items: [20,16,  37,114,  74,255]
	    },
	    {
	    	color: 3,
	    	speed: 2,
	    	gaps: [2,1,  11,2,  21,2,  28,3,  35,2,  39,4,  49,1,  51,1, 61,1,  66,2,  76,9],
	    	items: [10,16,  48,118,  55,16, 60,117]
	    }
    ]
	},

	{
		number: 5,
		playerSize: 2,
	  startLine: 0,
	  startRow: 1,
	  title: 'One pill makes you bigger',
	  lines: [
	    {
	      color: 0,
	      speed: 2,
	      gaps: [8,3,  13,3,  21,1,  25,3,  37,1,  41,1,  51,9],
	      items: [49,255]
	    },
	    {
	    	color: 1,
	    	speed: 2,
	    	gaps: [3,3,  18,1,26,  1,33,  2,38,  2,44,  2,51,  9],
	    	items: [12,130,  23,128]
	    },
	    {
	    	color: 2,
	    	speed: 2,
	    	gaps: [7,2,  14,1,  22,2,  29,3,  42,1,  47,1,  51,9],
	    	items: [37,130]
	    },
	    {
	    	color: 3,
	    	speed: 2,
	    	gaps: [10,2,  16,2,  21,2,  25,2,  33,2,  38,3,  44,1,  51,9],
	    	items: [30,128]
	    }
    ]
	},

  {
   number: 6,
   playerSize: 2,
   startLine: 2,
   startRow: 0,
   title: 'Small and on the Side',
   lines: [
      {
        color: 0,
        speed: 2,
        gaps: [2,2,  10,3,  18,3,  26,1,  35,2,  45,2,  51,1,  55,1,  58,3,  65,1,  71,2,  76,9],
        items: [7,119,  17,20,  22,130,  33,113,  34,118,  54,20 ]
      },
      {
        color: 1,
        speed: 2,
        gaps: [6,3,  14,3,  22,1,  26,3,  32,2,  37,2,  41,2,  47,1,  57,2,  62,1,  68,1,  73,1,  76,9],
        items: [56,112]
      },
      {
        color: 2,
        speed: 2,
        gaps: [5,1,  11,1,  15,1,  19,1,  23,1,  27,1,  31,3,  43,2,  48,1,  51,2,  55,3,  63,4,  69,2,  76,9],
        items: [41,128,  47,16,  74,255]
      },
      {
        color: 3,speed: 2,
        gaps: [8,2,  12,1,  18,3,  24,2,  30,1,  37,3,  45,2,  49,1,  54,3,  60,1,  64,2,  72,2,  76,9 ],
        items: [43,118,  53,17,  71,118]
      },
      {
        color: 4,
        speed: 2,
        gaps: [2,2,  14,2,  26,3,  33,1,  41,5,  52,2,  59,3,  68,1,  74,11 ],
        items: [7,128,  13,118,  21,16,  25,118,  36,128,  40,16,  49,128]
      }
    ]
  },

  {
   number: 7,
   playerSize: 2,
   startLine: 2,
   startRow: 0,
   title: 'Clap on - Clap off',
   lines: [
      {
        color: 0,
        speed: 2,
        gaps: [4,2,10,2,22,2,28,1,31,2,40,3,51,9],
        items: [37,35]
      },
      {
        color: 1,
        speed: 2,
        gaps: [9,1,13,2,18,1,26,3,35,3,41,1,45,3,51,9],
        items: [32,35,34,120]
      },
      {
        color: 2,
        speed: 2,
        gaps: [5,2,16,5,24,1,31,2,34,2,42,1,51,9],
        items: [9,33,37,35,44,112]
      },
      {
        color: 3,
        speed: 2,
        gaps: [8,2,11,3,19,3,27,3,34,1,37,3,44,2,51,9],
        items: [18,16,33,16]
      },
      {
        color: 4,
        speed: 2,
        gaps: [4,2,14,1,19,1,23,2,32,2,39,2,51,9],
        items: [13,16,49,255]
      }
    ]
  },

  {
   number: 8,
   playerSize: 2,
    sizeAdjustments: [0, -0.1, 0, 0, 0],
   startLine: 2,
   startRow: 0,
   title: 'So symmetrical',
   lines: [
      {
        color: 0,
        speed: 2,
        gaps: [0,7,13,1,21,2,26,1,33,1,39,1,45,4,53,1,56,2,62,3,68,2,76,9],
        items: [9,34,12,19,30,130,52,119]
      },
      {
        color: 1,
        speed: 2,
        gaps: [0,5,9,2,16,3,24,1,28,3,36,1,43,2,51,1,59,1,76,9],
        items: [22,128,64,118]
      },
      {
        color: 2,
        speed: 2,
        gaps: [7,1,12,3,19,22,47,2,54,3,62,2,66,3,76,9],
        items: [74,255]
      },
      {
        color: 3,
        speed: 2,
        gaps: [0,5,9,2,16,3,24,1,28,3,36,1,43,2,51,1,59,1,67,1,76,9],
        items: [22,128,41,34,64,118]
      },
      {
        color: 4,
        speed: 2,
        gaps: [0,7,13,1,21,2,26,1,33,1,39,1,45,4,53,1,56,2,62,3,68,2,76,9],
        items: [9,34,12,17,30,130,52,119]
      }
    ]
  },

  {
   number: 9,
   playerSize: 2,
   startLine: 0,
   startRow: 0,
   title: 'Bumps in the Road',
   lines: [
      {
        color: 0,
        speed: 2,
        gaps: [6,3,51,9],
        items: [5,98,39,33,43,98]
      },
      {
        color: 1,
        speed: 2,
        gaps: [2,3,10,1,15,2,19,1,51,9],
        items: []
      },
      {
        color: 2,
        speed: 2,
        gaps: [6,2,12,2,51,9],
        items: [17,35,20,98,49,255]
      },
      {
        color: 3,
        speed: 2,
        gaps: [15,2,51,9],
        items: [14,96]
      },
      {
        color: 4,
        speed: 2,
        gaps: [13,1,51,9],
        items: [27,34,31,96,45,34,47,96]
      }
    ]
  },

  {
   number: 10,
   playerSize: 2,
   startLine: 2,
   startRow: 0,
   title: 'Three down, Two no go',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [0,5,11,5,22,3,29,2,33,3,39,2,43,6,53,1,59,1,67,1,76,9],
        items: [21,118,42,113,58,20],
      },
      {
        color: 1,
        speed: 2,
        gaps: [0,4,7,2,12,2,19,5,31,2,35,2,42,5,50,1,56,2,62,3,68,4,76,9],
        items: [],
      },
      {
        color: 2,
        speed: 2,
        gaps: [6,4,16,1,21,1,26,2,39,1,44,1,49,6,59,2,65,1,69,1,76,9],
        items: [43,98,74,255],
      },
      {
        color: 3,
        speed: 2,
        gaps: [6,4,16,3,24,4,35,4,42,1,47,3,55,4,63,4,76,9],
        items: [],
      },
      {
        color: 4,
        speed: 2,
        gaps: [0,4,7,2,12,2,19,2,25,2,31,2,37,1,42,1,45,1,52,1,56,2,62,1,68,2,76,9],
        items: [39,35],
      },
      {
        color: 5,
        speed: 2,
        gaps: [0,5,11,5,22,3,30,5,42,1,52,2,59,1,65,1,71,2,76,9],
        items: [21,119,41,16,49,35,58,17],
      }
    ]
  },

  {
    number: 11,
    playerSize: 2,
    startLine: 2,
    startRow: 0,
    title: 'It\'s Tough at the Bottom',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [0,3,8,1,12,5,20,7,32,1,37,2,44,2,49,1,57,2,62,1,66,1,72,3,78,9],
        items: [11,119,43,21],
      },
      {
        color: 1,
        speed: 2,
        gaps: [0,3,5,1,11,7,22,4,29,1,35,1,41,3,49,1,53,3,59,1,65,1,69,1,73,1,76,11],
        items: [45,35,52,112],
      },
      {
        color: 2,
        speed: 2,
        gaps: [7,3,16,4,23,2,28,1,31,2,38,1,53,1,58,3,64,1,68,1,78,9],
        items: [43,37,44,115,51,36,52,98],
      },
      {
        color: 3,
        speed: 2,
        gaps: [0,5,8,1,12,2,17,4,27,2,34,3,40,2,44,5,51,1,60,2,67,1,71,1,75,1,78,9],
        items: [22,117,52,115,59,16,76,98],
      },
      {
        color: 4,
        speed: 2,
        gaps: [0,6,12,3,18,1,23,2,28,2,36,3,42,2,47,2,55,2,59,1,65,2,70,3,75,1,78,9],
        items: [11,118,33,35,35,96,46,16],
      },
      {
        color: 5,
        speed: 2,
        gaps: [0,4,7,2,13,2,21,5,32,2,40,2,46,2,50,2,55,2,62,1,69,2,74,2,78,9],
        items: [76,255],
      }
    ]
  },

  {
    number: 12,
    playerSize: 2,
    startLine: 2,
    startRow: 0,
    title: 'Around the Trouble',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [0,5,10,1,16,2,25,2,30,2,38,2,42,2,49,2,53,2,62,9],
        items: [60,255],
      },
      {
        color: 1,
        speed: 2,
        gaps: [0,4,7,1,13,4,20,3,29,1,34,2,42,1,46,1,50,1,56,4,62,9],
        items: [52,112],
      },
      {
        color: 2,
        speed: 2,
        gaps: [9,3,21,2,25,2,32,1,38,2,53,1,59,1,62,9],
        items: [7,120,45,98,49,36],
      },
      {
        color: 3,
        speed: 2,
        gaps: [0,4,7,2,14,3,22,1,28,3,34,2,42,2,47,4,58,2,62,9],
        items: [],
      },
      {
        color: 4,
        speed: 2,
        gaps: [0,5,9,4,18,2,25,1,32,1,36,3,43,1,56,2,62,9],
        items: [29,35,46,37,55,96],
      },
      {
        color: 5,
        speed: 2,
        gaps: [0,6,15,1,21,1,27,3,35,2,42,2,50,2,57,2,62,9],
        items: [34,18,46,36,56,16],
      }
    ]
  },

  {
    number: 13,
    playerSize: 2,
    startLine: 4,
    startRow: 0,
    title: 'Fast Fingers Only',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [0,9,14,6,28,3,34,1,36,1,40,3,46,3,52,9],
        items: [11,130,24,21,33,20,35,120],
      },
      {
        color: 1,
        speed: 2,
        gaps: [0,8,11,1,15,1,22,2,26,1,29,1,32,2,38,1,41,4,47,2,52,9],
        items: [],
      },
      {
        color: 2,
        speed: 2,
        gaps: [0,6,9,4,18,1,21,2,25,3,31,1,35,5,42,4,48,1,52,9],
        items: [50,255],
      },
      {
        color: 3,
        speed: 2,
        gaps: [0,3,8,2,13,5,20,2,24,1,28,2,33,2,40,1,43,4,52,9],
        items: [],
      },
      {
        color: 4,
        speed: 2,
        gaps: [7,2,12,1,16,1,20,1,23,2,30,3,37,1,41,1,44,1,48,2,52,9],
        items: [5,128],
      },
      {
        color: 5,
        speed: 2,
        gaps: [0,3,10,1,14,1,18,1,22,1,27,1,35,4,47,2,52,9],
        items: [45,130],
      }
    ]
  },

	{
		number: 14,
		playerSize: 2,
    startLine: 2,
    startRow: 0,
    title: 'Just Go Around',
    lines: [
      {
        color: 0,
        speed: 2,
        gaps: [19,4,27,3,36,3,45,2,54,2,62,9],
        items: [7,118,15,21,41,36,42,112],
      },
      {
        color: 1,
        speed: 2,
        gaps: [21,1,28,1,32,1,37,1,41,2,48,2,55,2,59,1,62,9],
        items: [10,117,36,117],
      },
      {
        color: 2,
        speed: 2,
        gaps: [25,1,31,3,40,1,45,1,52,1,62,9],
        items: [7,120,13,117,23,35,37,98,51,20,60,255],
      },
      {
        color: 3,
        speed: 2,
        gaps: [24,3,35,4,43,1,47,2,52,3,58,2,62,9],
        items: [7,117,21,117],
      },
      {
        color: 4,
        speed: 2,
        gaps: [22,1,29,3,34,2,41,1,48,1,55,3,62,9],
        items: [5,120,20,118,37,18],
      },
      {
        color: 5,
        speed: 2,
        gaps: [19,1,25,2,34,2,45,1,52,1,62,9],
        items: [6,119,12,114,43,36,51,16],
      }
    ]
	}


];

let _levelHigh = utils.getLocalInt(LOCAL_LEVEL_HIGH, 0);
let _levelPlus = utils.getLocalInt(LOCAL_LEVEL_PLUS, 0);
let _levelPlusHigh = utils.getLocalInt(LOCAL_LEVEL_PLUS_HIGH, 0);

// PUBLIC --------------------------------------------------------------------------------------------------------------

let _public = {

  /// length
  /// Number of levels available.
  get length() {
    return _levels.length;
  },


  /// levelHigh
  /// The persisted highest level reached. Cannot be set to lower than the current value.
  get levelHigh() {
    return _levelHigh;
  },
  set levelHigh(iVal) {
    if (iVal > _levelHigh) {
      _levelHigh = iVal;
      utils.setLocalInt(LOCAL_LEVEL_HIGH, iVal);
    }

    if (iVal === _levels.length && _levelPlus === _levelPlusHigh) {
      ++_public.levelPlusHigh;
      ++_public.levelPlus;
    }
  },
  

  /// levelPlus
  /// Indicates the number of times all levels have been completed. Speed increases each time. Cannot be set to 
  /// anything higher than the highest number achieved (levelPlusHigh).
  get levelPlus() {
    return _levelPlus;
  },
  set levelPlus(iVal) {
    if (iVal <= _levelPlusHigh) {
      if (iVal > _levelPlus) {
        utils.setLocalInt(LOCAL_LEVEL_PLUS, iVal);
      }

      _levelPlus = iVal;
    }
  },


  /// levelPlusHigh
  /// The persisted high for levelPlus.
  get levelPlusHigh() {
    return _levelPlusHigh;
  },
  set levelPlusHigh(iVal) {
    if (iVal > _levelPlusHigh) {
      _levelPlusHigh = iVal;
      utils.setLocalInt(LOCAL_LEVEL_PLUS_HIGH, iVal);
    }
  },
  

	/// getLevel(iLevel)
	/// Get an object describing the level.
	/// 	iLevel	- Level (0..n) to get descriptor for.
	/// Returns a generic object describing the requested level {?}.
	getLevel(iLevel) {

/* BEGIN CODE FOR EMBEDDING IN EDITOR */
// let sTest = 'IMPORT FROM EDITOR';
// let oLevel = window.__editorLevel;
// if (oLevel) {
//   oLevel.number = 1;
//   oLevel.playerSize = 2;
//   oLevel.title = 'Custom Level...';
//   _levels[0] = oLevel;
// }
/* END CODE FOR EMBEDDING IN EDITOR */

    const iLen = _levels.length;
    const nSpeed = _speeds[_levelPlus];
    const oRet = _levels[iLevel % iLen];

    if (!oRet) {
      throw new Error(`Invalid level <${iLevel}>`);
    }

    // Adjust speed for 2nd, 3rd, etc pass through the levels.
    // NOTE: Original plan was for lines to have independent speeds
    oRet.lines.forEach(oLine => oLine.speed = nSpeed);

		return oRet;
	},


};


// INIT ================================================================================================================

export default _public;