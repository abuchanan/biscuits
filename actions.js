'use strict';

function ActionsService() {

  var defaultDuration = 150;

  function makeMovement(body, direction, deltaX, deltaY, duration) {
    duration = duration || defaultDuration;

    var oldPos, newPos;

    function doMove() {
        body.setDirection(direction);
        var pos = body.getPosition();
        oldPos = pos;
        body.setPosition(pos.x + deltaX, pos.y + deltaY);
        newPos = body.getPosition();
    }

    var action = makeAction(duration, doMove);
    return _.extend(action, {
      isMoving: true,
      // TODO getter
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY,
      getPositionAt: function(percent) {
        return {
          x: oldPos.x + ((newPos.x - oldPos.x) * percent),
          y: oldPos.y + ((newPos.y - oldPos.y) * percent),
        };
      },
    });
  }

  function makeAction(duration, startCallback, endCallback) {
    return {
      duration: duration,
      startCallback: startCallback,
      endCallback: endCallback,
    };
  }


  function StateHandler() {

    var intervalId;
    var stop = makeAction(0);

    var state = stop;
    var nextState = stop;

    function move() {
      // TODO hardcoded stop kinda sucks?
      if (state !== stop) {
        state.start();

        // TODO accurate timer
        // TODO use game timeout that's capable of pause
        intervalId = setTimeout(callback, state.duration);
        nextState = state;
      }
    }

    function callback() {
      state.end();
      state = nextState;
      move();
    }

    function makePrivateState(moveDef) {
      return {
        duration: moveDef.duration,
        moveDef: moveDef,
        startTime: null,
        start: function() {
          this.startTime = new Date().getTime();

          if (moveDef.startCallback) {
            moveDef.startCallback();
          }
        },
        end: function() {
          if (moveDef.endCallback) {
            moveDef.endCallback();
          }
        },
      }
    }

    function makePublicState(state) {
      return {
        moveDef: state.moveDef,
        getPercentComplete: function() {

          if (state.moveDef.duration <= 0) {
            var percent = 1;
          } else {
            var time = new Date().getTime();
            var percent = (time - state.startTime) / state.moveDef.duration;

            if (percent < 0) {
              percent = 0;
            }
            else if (percent > 1) {
              percent = 1;
            }
          }
          return percent;
        },
      };
    }


    return {
      getState: function() {
        if (state !== stop) {
          return makePublicState(state);
        } else {
          return false;
        }
      },
      start: function(moveDef) {
        if (moveDef && state.moveDef !== moveDef) {
          if (state === stop) {
            state = makePrivateState(moveDef);
            move();
          } else {
            nextState = makePrivateState(moveDef);
          }
        }
      },
      stop: function(moveDef) {
        if (nextState.moveDef === moveDef) {
          nextState = stop;
        }
      },
      stopAll: function() {
        nextState = stop;
      },
    };
  }

  return {
    makeMovement: makeMovement,
    makeAction: makeAction,
    makeStateHandler: StateHandler,
  };
}
