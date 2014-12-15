define([
  'actions/InputBinder',
  'actions/StateMachine',
  'actions/Action',
  'actions/Movement',
  'lib/howler',
  'lib/pixi',
  './BasicRenderer',
  './textures',
  'utils',

], function(InputBinder, StateMachine, Action, Movement, howler, PIXI, BasicRenderer,
            textures, utils) {

  return function(s) {

      var idle = Idle();
      var attack = Attack();
      var use = Use();
  };


    function Use(world, body) {
        var api = {};

        var progress = Progress(1000);
        ForwardBodyEvent('use', world, body);
        api.renderable = BasicRenderer('use', body);

        return api;
    }


    // TODO bad name
    function ForwardBodyEvent(eventName, world, body) {

        var bb = body.getRectangle();
        bb.extend('forward', 1);

        var hits = world.query(bb);

        for (var i = 0, ii = hits.length; i < ii; i++) {
            if (hits[i] !== body) {
                hits[i].trigger(eventName, [body]);
            }
        }
    }


    function ActionSound(path) {
        var sound = new howler.Howl({urls: [path]});
        sound.play();
    }

});
