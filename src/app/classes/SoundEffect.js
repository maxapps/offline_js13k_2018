// Class which represents a sound effect.
// Based on code from https://github.com/kittykatattack/sound.js

const TERMINATE_IN_SECONDS = 1.2;

const _actx = new AudioContext();


// _addDissonance(mPan, oDef)
function _addDissonance(mPan, oDef) {
  const mOsc1 = _actx.createOscillator();
  const mOsc2 = _actx.createOscillator();
  const mVol1 = _actx.createGain();
  const mVol2 = _actx.createGain();

  mVol1.gain.value = oDef.volumeValue;
  mVol2.gain.value = oDef.volumeValue;

  mOsc1.connect(mVol1);
  mVol1.connect(_actx.destination);
  mOsc2.connect(mVol2);
  mVol2.connect(_actx.destination);

  mOsc1.type = "sawtooth";
  mOsc2.type = "sawtooth";

  mOsc1.frequency.value = oDef.frequencyValue + oDef.dissonance;
  mOsc2.frequency.value = oDef.frequencyValue - oDef.dissonance;

  if (oDef.attack > 0) {
    _fadeIn(mVol1, oDef);
    _fadeIn(mVol2, oDef);
  }
  if (oDef.decay > 0) {
    _fadeOut(mVol1, oDef);
    _fadeOut(mVol2, oDef);
  }
  if (oDef.pitchBendAmount > 0) {
    _pitchBend(mOsc1, oDef);
    _pitchBend(mOsc2, oDef);
  }
  if (oDef.echo) {
    _addEcho(mVol1, mPan, oDef);
    _addEcho(mVol2, mPan, oDef);
  }
  if (oDef.reverb) {
    _addReverb(mVol1, mPan, oDef);
    _addReverb(mVol2, mPan, oDef);
  }

  _play(mOsc1);
  _play(mOsc2);
}


// _addEcho(mVolume, mPan, oDef) {
function _addEcho(mVolume, mPan, oDef) {
  const mFeedback = _actx.createGain();
  const mDelay = _actx.createDelay();
  const mFilter = _actx.createBiquadFilter();

  mDelay.delayTime.value = oDef.echo[0];
  mFeedback.gain.value = oDef.echo[1];
  if (oDef.echo[2]) mFilter.frequency.value = oDef.echo[2];

  mDelay.connect(mFeedback);
  if (oDef.echo[2]) {
    mFeedback.connect(mFilter);
    mFilter.connect(mDelay);
  } else {
    mFeedback.connect(mDelay);
  }

  mVolume.connect(mDelay);
  mDelay.connect(mPan);
}


// _addReverb(mVolume, mPan, oDef) {
function _addReverb(mVolume, mPan, oDef) {
  const aReverb = oDef.reverb;
  const mConvolver = _actx.createConvolver();

  mConvolver.buffer = _impulseResponse(aReverb[0], aReverb[1], aReverb[2], _actx);
  mVolume.connect(mConvolver);
  mConvolver.connect(mPan);
}


// _fadeIn(mVolume, oDef)
function _fadeIn(mVolume, oDef) {
  mVolume.gain.value = 0;
  mVolume.gain.linearRampToValueAtTime(0, _actx.currentTime);
  mVolume.gain.linearRampToValueAtTime(oDef.volumeValue, _actx.currentTime + oDef.attack);
}


// _fadeOut(mVolume, oDef) {
function _fadeOut(mVolume, oDef) {
  mVolume.gain.linearRampToValueAtTime(oDef.volumeValue, _actx.currentTime + oDef.attack);
  mVolume.gain.linearRampToValueAtTime(0, _actx.currentTime + oDef.attack + oDef.decay);
}


// _impulseResponse(nDur, nDecay, bReverse) {
function _impulseResponse(nDur, nDecay, bReverse) {
  const iLen = _actx.sampleRate * nDur;
  const mImpulse = _actx.createBuffer(2, iLen, _actx.sampleRate);

  const mLeft = mImpulse.getChannelData(0);
  const mRight = mImpulse.getChannelData(1);

  for (let i = 0; i < iLen; i++) {
    let iNum = bReverse ? iLen - i : i;

    mLeft[i] = (Math.random() * 2 - 1) * Math.pow(1 - iNum / iLen, nDecay);
    mRight[i] = (Math.random() * 2 - 1) * Math.pow(1 - iNum / iLen, nDecay);
  }

  return mImpulse;
}


// _pitchBend(mOscillator, oDef) {
function _pitchBend(mOscillator, oDef) {
  const iFreq = mOscillator.frequency.value;

  if (oDef.reverse) {
    mOscillator.frequency.linearRampToValueAtTime(iFreq, _actx.currentTime);
    mOscillator.frequency.linearRampToValueAtTime(
        iFreq + oDef.pitchBendAmount, _actx.currentTime + oDef.attack + oDef.decay);
  } else {
    mOscillator.frequency.linearRampToValueAtTime(iFreq, _actx.currentTime);
    mOscillator.frequency.linearRampToValueAtTime(
        iFreq - oDef.pitchBendAmount, _actx.currentTime + oDef.attack + oDef.decay);
  }
}


// _play(mNode) {
function _play(mNode) {
  mNode.start(_actx.currentTime);
  mNode.stop(_actx.currentTime + TERMINATE_IN_SECONDS);
}


// _randomInt(iMin, iMax){
function _randomInt(iMin, iMax){
  return Math.floor(Math.random() * (iMax - iMin + 1)) + iMin;
};


export default class {

  // PRIVATE -----------------------------------------------------------------------------------------------------------

  // PUBLIC ------------------------------------------------------------------------------------------------------------

  /// Constructor(oSound)
  /// ...
  constructor(oSound) {
    oSound = this.sound = Object.assign({}, oSound);
    this.oscillator = _actx.createOscillator();
    this.volume = _actx.createGain();
    this.pan = !_actx.createStereoPanner ? _actx.createPanner() :_actx.createStereoPanner();

    this.oscillator.connect(this.volume);
    this.volume.connect(this.pan);
    this.pan.connect(_actx.destination);

    this.volume.gain.value = oSound.volumeValue;
    if (!_actx.createStereoPanner) {
      this.pan.setPosition(oSound.panValue, 0, 1 - Math.abs(oSound.panValue));
    } else {
      this.pan.pan.value = oSound.panValue; 
    }

    this.oscillator.type = oSound.type;
    this.oscillator.frequency.value = oSound.randomValue > 0
      ? _randomInt(oSound.frequencyValue - oSound.randomValue / 2, oSound.frequencyValue + oSound.randomValue / 2)
      : oSound.frequencyValue;
  }


  /// play()
  /// ...
  play() {
    let oDef = this.sound;

    if (oDef.attack > 0) _fadeIn(this.volume, oDef);
    _fadeOut(this.volume, oDef);
    if (oDef.pitchBendAmount > 0) _pitchBend(this.oscillator, oDef);
    if (oDef.echo) _addEcho(this.volume, this.pan, oDef);
    if (oDef.reverb) _addReverb(this.volume, this.pan, oDef);
    if (oDef.dissonance > 0) _addDissonance(this.pan, oDef);


    this.oscillator.start(_actx.currentTime);
    this.oscillator.stop(_actx.currentTime + TERMINATE_IN_SECONDS);
  }
  

}
