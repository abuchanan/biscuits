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
              north: Movement({
                  name: 'walk-north',
                  direction: 'north',
                  deltaY: -1,
                  duration: 250,
              }),

              south: Movement({
                  name: 'walk-south',
                  direction: 'south',
                  deltaY: 1,
                  duration: 250,
              }),

              east: Movement({
                  name: 'walk-east',
                  direction: 'east',
                  deltaX: 1,
                  duration: 250,
              }),

              west: Movement({
                  name: 'walk-west',
                  direction: 'west',
                  deltaX: -1,
                  duration: 250,
              }),
          },

          stay: Action({name: 'stop-south', duration: 2000}),

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
