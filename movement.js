function MovementHandler(player, options) {

  // TODO configureable speed

  function makeHandler(direction, deltaX, deltaY, timeout) {
    return {
      direction: direction,
      deltaX: deltaX,
      deltaY: deltaY,
      timeout: timeout,
      getCurrentPosition: function() {
        var time = new Date().getTime();
        var percent = (time - this.start) / timeout;

        if (percent < 0) {
          percent = 0;
        }
        else if (percent > 1) {
          percent = 1;
        }

        var pos = {
          x: this.oldPos.x + ((this.newPos.x - this.oldPos.x) * percent),
          y: this.oldPos.y + ((this.newPos.y - this.oldPos.y) * percent),
        };
        return {
          percent: percent,
          position: pos,
        }
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
      timeout: 0,
      getCurrentPosition: function() {
        return {
          percent: 0,
          position: player.getPosition(),
        }
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
        intervalId = setTimeout(callback, state.timeout);
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

  var defaultDuration = 150;

  var up = makeHandler('up', 0, -1, defaultDuration);
  var down = makeHandler('down', 0, 1, defaultDuration);
  var left = makeHandler('left', -1, 0, defaultDuration);
  var right = makeHandler('right', 1, 0, defaultDuration);

  return {
    getState: function() {
      return statehandler.getState();
    },
    handleEvent: function(eventname) {

      // TODO this is all broken. shouldn't be able to change direction until
      //      the current movement finishes.
      function keydown(move) {
        statehandler.start(move);
      }

      function keyup(move) {
        statehandler.stop(move);
      }

      // TODO ugh....another bug here when keyup event happens during a different window
      //      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
      //      window focus/blur events?
      switch (eventname) {
        case 'Up keydown':
          keydown(up);
          break;

        case 'Down keydown':
          keydown(down);
          break;

        case 'Left keydown':
          keydown(left);
          break;

        case 'Right keydown':
          keydown(right);
          break;

        case 'Right keyup':
          keyup(right);
          break;

        case 'Left keyup':
          keyup(left);
          break;

        case 'Up keyup':
          keyup(up);
          break;

        case 'Down keyup':
          keyup(down);
          break;
      }


    }
  };
}
