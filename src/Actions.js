import {Inject, TransientScope} from 'di';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Input} from 'src/input';
import EventEmitter from 'lib/EventEmitter';

export {
  movementDefaults,
  Action,
  Movement,
  ActionManager,
  ActionInputHelperFactory,
  ActionInputHelper
};


var movementDefaults = {
  deltaX: 0,
  deltaY: 0,
};

// Extend a given object with all the properties in passed-in object(s).
function extend(obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

// TODO inject
class Action {
  constructor(duration = 150) {
    // TODO duration cannot be less than 0. check this.
    this.duration = duration;
  }
  start() {}
  tick() {}
}


// TODO if you deltaX/deltaY on the action after creationg,
//      it wouldn't take effect here
class Movement extends Action {

  constructor(name, body, direction, deltaX, deltaY, duration = 150) {
    super(duration);
    this.name = name;
    this.body = body;
    this.direction = direction;
    this.deltaX = deltaX;
    this.deltaY = deltaY;

    this._lastPos;
    this._startTime;
    this._percentComplete = 0;
    this._moving = false;
  }

  _updatePercentComplete(time) {
  // TODO what would happen if you changed duration in the middle of a move?
    this._percentComplete = (time - this._startTime) / this.duration;
  }

  // TODO getter? needed?
  interpolatePosition() {
    if (!this._moving) {
      return this.body.getPosition();
    }

    var pos = this._lastPos;
    var percent = this._percentComplete;
    return {
      x: pos.x + (this.deltaX * percent),
      y: pos.y + (this.deltaY * percent),
    };
  }

  start(startTime, done) {

    this.body.direction = this.direction;

    try {
      var pos = this.body.getPosition();
      this._startTime = startTime;

      this.body.setPosition(pos.x + this.deltaX, pos.y + this.deltaY);
      this._lastPos = pos;
      this._moving = true;

    } catch (e) {
      if (e == 'blocked') {
        this._moving = false;
      } else {
        throw e;
      }
    }
  }
  
  tick(time, done) {
    this._updatePercentComplete(time);

    if (this._percentComplete > 1) {
      this._percentComplete = 0;
      this._lastPos = false;
      this._moving = false;
      done();
    }
  }
}


@TransientScope
@Inject(Scene)
function ActionManager(scene) {

  var state = false;
  var nextState = false;

  // TODO this is a little off. say the current time is 20 ticks past
  //      the stop time of the current state. the current state will
  //      stop, but the next state will get a start time of now, instead
  //      of 20 ticks ago.
  function switchState(startTime) {

    function done() {
      state = false;
    }

    state = nextState;
    if (state) {
      state.action.start(startTime, done);
    }
  }

  function tick(time) {

    function done() {
      switchState(time);
    }

    if (state) {
      state.action.tick(time, done);
    } else if (nextState) {
      switchState(time);
    }
  }

  scene.events.on('scene tick', tick);

  function State(action) {
    return {
      action: action,
    }
  }

  return {
    getState: function() {
      if (state) {
        return state;
      } else {
        return State('stop');
      }
    },

    start: function(action) {
      if (!action) {
        return;
      }
      // Don't start if we're already doing that action
      if (state && state.action === action) {
        return;
      }
      nextState = State(action);
    },

    stop: function(action) {
      // Only stop if we're currently running the action that was
      // requested to be stopped.
      if (nextState && nextState.action === action) {
        nextState = false;
      }
    },

    stopAll: function() {
      nextState = false;
    },
  };
}

// TODO I don't like this "...Factory" name pattern
@SceneScope
@Inject(Input, Scene)
function ActionInputHelperFactory(input, scene) {
  return function(manager) {
    return new ActionInputHelper(input, scene, manager);
  }
}

class ActionInputHelper {
  constructor(input, scene, manager) {
    var actions = this._actions = {};

    scene.events.on('scene tick', function() {

      // TODO optimize?
      for (var name in actions) {
        if (input[name]) {
          manager.start(actions[name]);
        } else {
          manager.stop(actions[name]);
        }
      }
    });
  }

  bind(name, action) {
    this._actions[name] = action;
  }
}
