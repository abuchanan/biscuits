define(['utils'], function(utils) {

    function Action(config) {

        var defaults = {
          duration: 150,
        };
        config = utils.extend({}, defaults, config || {});


        return function() {
            // TODO this is a little off. say the current time is 20 ticks past
            //      the stop time of the current state. the current state will
            //      stop, but the next state will get a start time of now, instead
            //      of 20 ticks ago.
            var startTime = Date.now();

            function tick() {
              var now = Date.now();
              action.percentComplete = (now - startTime) / config.duration;

              if (action.percentComplete > 1) {
                action.percentComplete = 1;
                action.done = true;
              }
            }

            // Action API
            var action = {
              percentComplete: 0,
              done: false,
              tick: tick,
              loop: config.loop,
              config: config,
              name: config.name,
            };

            return action;
        }
    }


    // Module exports
    return Action;
});
