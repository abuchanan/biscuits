define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Action',
  'actions/Movement',
  'utils',

], function(InputBinder, ActionManager, Action, BaseMovement, utils) {

  return function(body, input, scene) {

      var Movement = BaseMovement.bind(null, body);

      var actionManager = ActionManager();
      var bindInput = InputBinder(input, actionManager);

      scene.events.on('tick', actionManager.tick);

      var actions = {
          walk: {
              north: Movement({
                  name: 'walk-north',
                  direction: 'north',
                  deltaY: -1,
                  duration: 250,
                  loop: true,
              }),

              south: Movement({
                  name: 'walk-south',
                  direction: 'south',
                  deltaY: 1,
                  duration: 250,
                  loop: true,
              }),

              east: Movement({
                  name: 'walk-east',
                  direction: 'east',
                  deltaX: 1,
                  duration: 250,
                  loop: true,
              }),

              west: Movement({
                  name: 'walk-west',
                  direction: 'west',
                  deltaX: -1,
                  duration: 250,
                  loop: true,
              }),
          },
          attack: Attack(scene.world, body),
      };

      bindInput('Up', actions.walk.north);
      bindInput('Down', actions.walk.south);
      bindInput('Left', actions.walk.west);
      bindInput('Right', actions.walk.east);
      bindInput('Attack', actions.attack);

      return actionManager;
  };


  function Attack(world, body, config) {

      var defaults = {
          name: 'attack',
          duration: 200,
      };
      config = utils.extend({}, defaults, config || {});

      var makeAction = Action(config);

      return function() {
          var action = makeAction();
          var bb = body.getRectangle();
          bb.extend('forward', 1);
          var hits = world.query(bb);

          console.log('attack!', hits);

          for (var i = 0, ii = hits.length; i < ii; i++) {
              if (hits[i] !== body) {
                  hits[i].events.trigger('hit', [body]);
              }
          }

          return action;
      };
  }

});

/*


class Use extends Action {

  constructor(superConstructor: SuperConstructor, body: Body) {
    superConstructor();
    this.body = body;

    this.configure({
      name: 'use',
      duration: 1000,
    });
  }

  start() {
    super.start();

    // TODO optimize?
    // TODO can only use one object?
    var body = this.body;
    body.queryFront().forEach(function(hit) {
      hit.events.trigger('use', [body]);
    });
  }
}


*/
