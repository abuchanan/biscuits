'use strict';

var EventEmitter = require('lib/EventEmitter');
var _ = require('underscore');

var actionDefaults = {
  duration: 150,
};

var movementDefaults = {
  deltaX: 0,
  deltaY: 0,
};

exports.actionDefaults = actionDefaults;
exports.movementDefaults = movementDefaults;
exports.Action = Action;
exports.Movement = Movement;
exports.Manager = Manager;
exports.KeysHelper = KeysHelper;


function Action(options) {
  // TODO duration cannot be less than 0. check this.
  return _.extend({}, actionDefaults, options, {
    events: new EventEmitter(),
  });
}


// TODO if you deltaX/deltaY on the action after creationg,
//      it wouldn't take effect here
function Movement(body, direction, options) {

  options = _.extend({}, movementDefaults, options, {
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

    body.setDirection(direction);
    body.setPosition(pos.x + options.deltaX, pos.y + options.deltaY);

    moving = true;
  });

  action.events.on('action end', function() {
    moving = false;
  });

  return action;
}


function Manager() {

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

    tick: tick,
  };
}

function KeysHelper(manager, events) {
  return {
    bind: function(key, action) {
      events.on(key + ' keydown', manager.start.bind(manager, action));
      events.on(key + ' keyup', manager.stop.bind(manager, action));
    }
  };
}
