define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Movement',

], function(InputBinder, ActionManager, BaseMovement) {

  return function(scene, body) {

      var Movement = BaseMovement.bind(null, body);

      var actionManager = ActionManager();
      scene.events.on('tick', actionManager.tick);

      var actions = {
          walk: {
              up: Movement({
                  name: 'walk-up',
                  direction: 'up',
                  deltaY: -1,
                  duration: 250,
              }),

              down: Movement({
                  name: 'walk-down',
                  direction: 'down',
                  deltaY: 1,
                  duration: 250,
              }),

              right: Movement({
                  name: 'walk-right',
                  direction: 'right',
                  deltaX: 1,
                  duration: 250,
              }),

              left: Movement({
                  name: 'walk-left',
                  direction: 'left',
                  deltaX: -1,
                  duration: 250,
              }),
          },
          manager: actionManager,
      };

      return actions;
  };

});
