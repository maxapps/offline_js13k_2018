// Game loop which eliminates timing issues.
// Thanks to article "A Detailed Explanation of JavaScript Game Loops and Timing".
// http://www.isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing).

const NOOP = function() {};

let _simulationTimestep = 1000 / 60,
    _frameDelta = 0,
    _lastFrameTimeMs = 0,
    _fps = 60,
    _lastFpsUpdate = 0,
    _framesThisSecond = 0,
    _numUpdateSteps = 0,
    _minFrameDelay = 0,
    _running = false,
    _started = false,
    _panic = false,
    _begin = NOOP,
    _update = NOOP,
    _draw = NOOP,
    _end = NOOP,
    _rafHandle;


// _animate(timestamp)
function _animate(timestamp) {
  _rafHandle = requestAnimationFrame(_animate);

  if (timestamp < _lastFrameTimeMs + _minFrameDelay) {
      return;
  }

  _frameDelta += timestamp - _lastFrameTimeMs;
  _lastFrameTimeMs = timestamp;

  _begin(timestamp, _frameDelta);

  if (timestamp > _lastFpsUpdate + 1000) {
    _fps = 0.25 * _framesThisSecond + 0.75 * _fps;

    _lastFpsUpdate = timestamp;
    _framesThisSecond = 0;
  }
  _framesThisSecond++;

  _numUpdateSteps = 0;
  while (_frameDelta >= _simulationTimestep) {
    _update(_simulationTimestep);
    _frameDelta -= _simulationTimestep;
    if (++_numUpdateSteps >= 240) {
      _panic = true;
      break;
    }
  }

  _draw(_frameDelta / _simulationTimestep);

  _end(_fps, _panic);

  _panic = false;
}


export default {
  getSimulationTimestep() {
    return _simulationTimestep;
  },

  setSimulationTimestep(timestep) {
    _simulationTimestep = timestep;
    return this;
  },

  getFPS() {
    return _fps;
  },

  getMaxAllowedFPS() {
    return 1000 / _minFrameDelay;
  },

  setMaxAllowedFPS(_fps) {
    if (typeof _fps === 'undefined') {
      _fps = Infinity;
    }
    if (_fps === 0) {
      this.stop();
    }
    else {
      // Dividing by Infinity returns zero.
      _minFrameDelay = 1000 / _fps;
    }
    return this;
  },

  resetFrameDelta() {
    let oldFrameDelta = _frameDelta;
    _frameDelta = 0;
    return oldFrameDelta;
  },

  setBegin(fun) {
    _begin = fun || _begin;
    return this;
  },

  setUpdate(fun) {
    _update = fun || _update;
    return this;
  },

  setDraw(fun) {
    _draw = fun || _draw;
    return this;
  },

  setEnd(fun) {
    _end = fun || _end;
    return this;
  },

  start() {
    if (!_started) {
      _started = true;
      _rafHandle = requestAnimationFrame(function(timestamp) {
        _draw(1);
        _running = true;
        _lastFrameTimeMs = timestamp;
        _lastFpsUpdate = timestamp;
        _framesThisSecond = 0;
        _rafHandle = requestAnimationFrame(_animate);
      });
    }
    return this;
  },

  stop() {
    _running = false;
    _started = false;
    cancelAnimationFrame(_rafHandle);
    return this;
  },

  isRunning() {
    return _running;
  },
}