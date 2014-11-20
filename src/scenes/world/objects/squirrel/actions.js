define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Action',
  'actions/Movement',

], function(InputBinder, ActionManager, Action, BaseMovement) {

  return function(scene, body) {

      var Movement = BaseMovement.bind(null, body);

      // TODO what would you do if you wanted to be able to hit multiple targets?
      //      you'd need a manager per target. What if you had multiplayer?
      var hitManager = ActionManager();
      var moveManager = ActionManager();

      // TODO bind actions to their managers here in the action config
      //      so that other parts of the code which use managers don't have
      //      to worry about the concept of managers.

      scene.events.on('tick', moveManager.tick);
      scene.events.on('tick', hitManager.tick);

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

          hitPlayer: HitPlayer(scene.player),

          hitManager: hitManager,
          moveManager: moveManager,

          destroy: function() {
              scene.events.off('tick', moveManager.tick);
              scene.events.off('tick', hitManager.tick);
          },
      };

      return actions;
  };


  // TODO running into a wall and being blocked should still trigger a collision


  function HitPlayer(player) {
      var makeAction = Action({duration: 1000});

      return function() {
          var action = makeAction();
          player.body.events.trigger('hit');
          return action;
      };
  }

});
