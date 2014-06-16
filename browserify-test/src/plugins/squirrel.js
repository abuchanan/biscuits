import {Inject, InjectLazy, TransientScope} from 'di';
import {Movement, ActionManager} from 'src/Actions';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Body} from 'src/world';

export {SquirrelLoader, SquirrelActions, SquirrelDriver};
// TODO injector per world object? would make things even more pluggable,
//      but tradeoff is memory space.


class SquirrelBody extends Body {

  constructor(events, world, config) {
    super(events, world, config);
    // TODO could use mixin(Body, BodyDirection)
    this.direction = 'down';
  }
}

@TransientScope
@Inject(ActionManager, Body)
class SquirrelActions {
  constructor(manager, body) {
    this.manager = manager

    this.walkUp = Movement(body, 'up', {deltaY: -1, duration: 250});
    this.walkDown = Movement(body, 'down', {deltaY: 1, duration: 250});
    this.walkLeft = Movement(body, 'left', {deltaX: -1, duration: 250});
    this.walkRight = Movement(body, 'right', {deltaX: 1, duration: 250});
  }
}
// TODO sporadic animation. a squirrel isn't a fluid animation loop.


@TransientScope
@Inject(Scene, SquirrelActions)
function SquirrelDriver(scene, actions) {
  console.log('actual driver');

  scene.events.on('scene tick', function() {
    /*
    if (// squirrel doesn't have a current action
    // TODO update squirrel AI
    */
  });
}


@SceneScope
@Inject(Scene)
@InjectLazy(SquirrelBody, SquirrelActions, SquirrelDriver)
function SquirrelLoader(scene, createBody, createActions, startDriver) {
  return function(def, obj) {
    var life = 10;

    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
    };

    obj.body = createBody('body-config', bodyConfig);
    var actions = createActions(Body, obj.body);
    startDriver(SquirrelActions, actions);
  }
}
