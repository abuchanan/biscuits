define(function() {

    function ActionManager(s) {

        var currentAction = false;
        var nextAction = false;

        s.on('tick', function() {

          if (currentAction) {
            currentAction.tick();

            if (!currentAction.done) {
              return;
            }
          }

          if (nextAction) {
            currentAction = nextAction();
            if (!currentAction.loop) {
                nextAction = false;
             }
          } else {
            currentAction = false;
          }
        });

        s.getCurrentAction = function() {
            if (currentAction) {
                return currentAction;
            }
        };

        s.start = function(action) {
            if (action) {
                nextAction = action;
            }
        };

        s.stop = function(action) {
            // Only stop if we're currently running the action that was
            // requested to be stopped.
            if (nextAction && nextAction === action) {
                nextAction = false;
            }
        };

        s.stopAll = function() {
            nextAction = false;
        };
    }

    // Module exports
    return ActionManager;
});
