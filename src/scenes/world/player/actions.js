define([
  'actions/InputBinder',
  'actions/ActionManager',
  'actions/Action',
  'actions/Movement',
  'utils',

], function(InputBinder, ActionManager, Action, BaseMovement, utils) {

  return function(s, body) {

      var Movement = BaseMovement.bind(null, body);

      var actionManager = s.create(ActionManager);
      var binder = s.create(InputBinder, actionManager);


    // TODO movement. Sometimes you want to change direction without moving
    //      to the next square. Can't do this with current setup.
      s.walk = {
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
      };
          
      s.attack = Attack(s.world, body),
      s.manager = actionManager;

      binder.bind('Up', s.walk.north);
      binder.bind('Down', s.walk.south);
      binder.bind('Left', s.walk.west);
      binder.bind('Right', s.walk.east);
      binder.bind('Attack', s.attack);
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
                  hits[i].trigger('hit', [body]);
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
