define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Movement',

], function(InputBinder, ActionManager, BaseMovement) {

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
      };

      bindInput('Up', actions.walk.up);
      bindInput('Down', actions.walk.down);
      bindInput('Left', actions.walk.left);
      bindInput('Right', actions.walk.right);

      return {
          player: {
              actionManager: actionManager,
          },
      };
  };

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


class Attack extends Action {

  constructor(superConstructor: SuperConstructor, body: Body, sounds: Sounds) {
    superConstructor();
    this.body = body;
    this.sounds = sounds;

    this.configure({
      name: 'attack',
      duration: 200,
    });
  }

  start() {
    super.start();
    console.log('attack!');

    this.sounds.swingSword.play();

    // TODO optimize?
    // TODO can only use one object?
    var body = this.body;
    body.queryFront().forEach(function(hit) {
      hit.events.trigger('hit', [body]);
    });
  }
}
*/
