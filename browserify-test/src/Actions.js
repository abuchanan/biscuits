import {Inject, TransientScope} from 'di';
import {Scene} from 'src/scene';
import {Input} from 'src/input';
import EventEmitter from 'lib/EventEmitter';

export {
  actionDefaults,
  movementDefaults,
  Action,
  Movement,
  ActionManager,
  ActionInputHelper
};

// TODO make injectable config (might end up as a class?)
// TODO check that this definition order works with exports
var actionDefaults = {
  duration: 150,
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
function Action(options) {
  // TODO duration cannot be less than 0. check this.
  return extend({}, actionDefaults, options, {
    events: new EventEmitter(),
  });
}


// TODO if you deltaX/deltaY on the action after creationg,
//      it wouldn't take effect here
function Movement(body, direction, options) {

  options = extend({}, movementDefaults, options, {
    // TODO getter? needed?
    direction: direction,
    interpolatePosition: function(percent) {
      if (!moving) {
        return body.getPosition();
      }
      return {
        x: lastPos.x + (options.deltaX * percent),
        y: lastPos.y + (options.deltaY * percent),
      };
    },
  });

  var action = Action(options);
  var moving = false;
  var lastPos = false;

  action.events.on('action start', function() {
    var pos = body.getPosition();
    lastPos = pos;

    body.direction = direction;
    body.setPosition(pos.x + options.deltaX, pos.y + options.deltaY);

    moving = true;
  });

  action.events.on('action end', function() {
    moving = false;
  });

  return action;
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
    if (state) {
      state.action.events.trigger('action end');
    }
    state = nextState;
    if (state) {
      state.startTime = startTime;
      state.action.events.trigger('action start');
    }
  }

  function tick(time) {
    if (state) {
      updateStatePercentComplete(time);

      if (state.percentComplete >= 1) {
        // The current state might have reached 100% at some time in the past.
        // For example, if the current state ended at time = 100, and we're
        // at time = 120, we're 20 ticks late to starting the next state.
        // 
        // So, adjust the start time of the next state so that it starts at
        // time = 100.
        var nextStateTime = state.startTime + state.action.duration;

        // We're stopping, end the current state.
        if (!nextState) {
          switchState(nextStateTime);

        // We're moving to a new state, end the current state,
        // and start the next.
        } else if (state !== nextState) {
          switchState(nextStateTime);

        // We're looping the current action.
        } else {
          state.startTime = nextStateTime;
          updateStatePercentComplete(time);
        }
      }
    } else if (nextState) {
      switchState(time);
    }
  }

  scene.events.on('scene tick', tick);

  // TODO what would happen if you changed duration in the middle of a move?
  function updateStatePercentComplete(time) {
    var percent = (time - state.startTime) / state.action.duration;
    if (percent > 1) {
      percent = 1;
    }
    state.percentComplete = percent;
  }

  function State(action) {
    return {
      action: action,
      percentComplete: 0,
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

@TransientScope
@Inject(Input, Scene, ActionManager)
class ActionInputHelper {
  constructor(input, scene, manager) {
    var helper = this;
    this._actions = {};
    this.manager = manager;

    scene.events.on('scene tick', function() {
      var action = helper._actions[input.event];
      if (action) {
        action[0].call(manager, action[1]);
      }
    });
  }

  bind(name, action) {
    this._actions[name + ' keydown'] = [this.manager.start, action];
    this._actions[name + ' keyup'] = [this.manager.stop, action];
  }
}
