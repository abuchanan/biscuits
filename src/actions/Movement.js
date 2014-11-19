define(['./Action', 'utils'], function(Action, utils) {

    function Movement(body, config) {

        // TODO name is required
        // TODO direction is required
        var defaults = {
          deltaX: 0,
          deltaY: 0,
        };
        config = utils.extend({}, defaults, config || {});

        return function() {
            var previousPosition = body.getPosition();
            var action = Action(config)();
            var originalTick = action.tick;

            body.direction = config.direction;

            try {

              // TODO need a more elaborate canMoveTo(x, y) method. Might want to check
              //      whether player can move to location without actually moving there
              body.setPosition(previousPosition.x + config.deltaX,
                               previousPosition.y + config.deltaY);

            } catch (e) {
              if (e == 'blocked') {
                action.done = true;
              } else {
                throw e;
              }
            }

            function tick() {
              if (!action.done) {
                originalTick();
              }
            }

            function interpolatePosition() {
                return {
                  x: previousPosition.x + (config.deltaX * action.percentComplete),
                  y: previousPosition.y + (config.deltaY * action.percentComplete),
                };
            }

            // Action API
            return utils.extend(action, {
                name: config.name,
                isMovement: true,
                tick: tick,
                interpolatePosition: interpolatePosition,
            });
        };
    }


    // Module exports
    return Movement;
});
