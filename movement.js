function MovementHandler(player, options) {

  // TODO configureable speed
  var defaultDuration = 150;

  function makeMovement(direction, deltaX, deltaY, duration) {
    duration = duration || defaultDuration;

    return {
      // TODO getter
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY,
      duration: duration,
      getPercentComplete: function() {
        var time = new Date().getTime();
        var percent = (time - this.start) / duration;

        if (percent < 0) {
          percent = 0;
        }
        else if (percent > 1) {
          percent = 1;
        }
        return percent;
      },
      getPositionAt: function(percent) {
        return {
          x: this.oldPos.x + ((this.newPos.x - this.oldPos.x) * percent),
          y: this.oldPos.y + ((this.newPos.y - this.oldPos.y) * percent),
        };
      },
    };
  }

  function StateHandler() {

    var intervalId;
    var stop = {
      direction: false,
      start: 0,
      deltaX: 0,
      deltaY: 0,
      duration: 0,
      getPercentComplete: function() {
        return 1;
      },
      getPositionAt: function(percent) {
        return player.getPosition();
      },
    };
    var state = stop;
    var nextState = stop;

    function move() {
      if (state !== stop) {
        player.setDirection(state.direction);
        var pos = player.getPosition();
        state.oldPos = pos;
        player.setPosition(pos.x + state.deltaX, pos.y + state.deltaY);
        state.newPos = player.getPosition();
        state.start = new Date().getTime();

        // TODO accurate timer
        intervalId = setTimeout(callback, state.duration);
        nextState = state;
      }
    }

    function callback() {
      var oldstate = state;
      state = nextState;
      move();
    }


    return {
      getState: function() {
        return state;
      },
      start: function(moveDef) {
        if (moveDef && state !== moveDef) {
          if (state === stop) {
            state = moveDef;
            move();
          } else {
            nextState = moveDef;
          }
        }
      },
      stop: function(moveDef) {
        if (nextState === moveDef) {
          nextState = stop;
        }
      },
    };
  }

  var statehandler = StateHandler();


  return {
    getState: function() {
      return statehandler.getState();
    },
    makeMovement: makeMovement,
    start: function(move) {
      statehandler.start(move);
    },
    stop: function(move) {
      statehandler.stop(move);
    },
  };
}
