define(['utils'], function(utils) {


    // TODO does an object need multiple managers?
    function ActionManager() {

        var currentAction = false;
        var nextAction = false;

        function tick() {

          if (currentAction) {
            currentAction.tick();

            if (!currentAction.done) {
              return;
            }
          }

          if (nextAction) {
            currentAction = nextAction();
          } else {
            currentAction = false;
          }
        }

        // ActionManager API
        return {
          getCurrentAction: function() {
            if (currentAction) {
              return currentAction;
            }
          },

          start: function(action) {
            if (!action) {
              return;
            }
            nextAction = action;
          },

          stop: function(action) {
            // Only stop if we're currently running the action that was
            // requested to be stopped.
            if (nextAction && nextAction === action) {
              nextAction = false;
            }
          },

          stopAll: function() {
            nextAction = false;
          },

          tick: tick,
        };
    }

    // Module exports
    return ActionManager;
});
