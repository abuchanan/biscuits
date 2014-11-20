define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Action',
  'actions/Movement',
  'utils',

], function(InputBinder, ActionManager, Action, BaseMovement, utils) {

  return function(scene) {

      var Movement = BaseMovement.bind(null, scene.player.body);

      var actionManager = ActionManager();
      var bindInput = InputBinder(scene.input, actionManager);

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
          attack: Attack(scene.player.body),
      };

      bindInput('Up', actions.walk.up);
      bindInput('Down', actions.walk.down);
      bindInput('Left', actions.walk.left);
      bindInput('Right', actions.walk.right);
      bindInput('Attack', actions.attack);

      scene.player.actionManager = actionManager;
  };


  function Attack(body, config) {

      var defaults = {
          name: 'attack',
          duration: 200,
      };
      config = utils.extend({}, defaults, config || {});

      var makeAction = Action(config);

      return function() {
          var action = makeAction();
          var hits = body.queryFront();

          console.log('attack!', hits);

          for (var i = 0, ii = hits.length; i < ii; i++) {
              hits[i].events.trigger('hit', [body]);
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