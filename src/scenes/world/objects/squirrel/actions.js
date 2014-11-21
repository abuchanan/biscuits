define([
  'actions/ActionManager',
  'actions/Action',
  'actions/Movement',

], function(ActionManager, Action, BaseMovement) {

  return function(s) {

      var Movement = BaseMovement.bind(null, s.body);

      // TODO what would you do if you wanted to be able to hit multiple targets?
      //      you'd need a manager per target. What if you had multiplayer?

      // TODO bind actions to their managers here in the action config
      //      so that other parts of the code which use managers don't have
      //      to worry about the concept of managers.

      var hitManager = s.create(ActionManager);
      var moveManager = s.create(ActionManager);

      s.walk = {
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
      };

      s.stay = Action({name: 'stop-south', duration: 2000});

      s.hitPlayer = HitPlayer(s.player);

      s.hitManager = hitManager;
      s.moveManager = moveManager;
  };


  // TODO running into a wall and being blocked should still trigger a collision


  function HitPlayer(player) {
      var makeAction = Action({duration: 1000});

      return function() {
          var action = makeAction();
          player.body.trigger('hit');
          return action;
      };
  }

});
