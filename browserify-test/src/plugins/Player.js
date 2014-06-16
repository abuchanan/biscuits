import {Inject, InjectLazy, TransientScope} from 'di';
import {Body} from 'src/world';
import {Input} from 'src/input';
import {Movement, ActionManager, ActionInputHelper} from 'src/Actions';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';

export {PlayerLoader};


class PlayerBody extends Body {

  constructor(events, world, config) {
    super(events, world, config);
    // TODO could use mixin(Body, BodyDirection)
    this.direction = 'down';
  }

  setPosition(x, y) {
    if (!this._isBlocked(x, y)) {
      super.setPosition(x, y);
      this._triggerCollisions();
    }
  }

  _isBlocked(x, y) {
    // TODO extract to world.containsBlock()?
    var rect = this.getRectangle();
    var bodies = this.world.query(x, y, rect.w, rect.h);

    // Check if the next tile is blocked.
    for (var i = 0, ii = bodies.length; i < ii; i++) {
      if (bodies[i] !== this && bodies[i].isBlock) {
        return true;
      }
    }

    return false;
  }

  _triggerCollisions() {
    var rect = this.getRectangle();
    var bodies = this.world.query(rect.x, rect.y, rect.w, rect.h);

    for (var i = 0, ii = bodies.length; i < ii; i++) {
      if (bodies[i] !== this) {
        // TODO trigger events on body or body.obj?
        bodies[i].obj.events.trigger('player collision', [this.obj]);
      }
    }
  }
}


// TODO load player coins from game save service
// TODO basic validation/balance checking
class PlayerCoins {

  constructor() {
    this._balance = 0;
  }

  deposit(amount) {
    this._balance += amount;
  }

  withdraw(amount) {
    this._balance -= amount;
  }

  balance() {
    return this._balance;
  }
}


// TODO when keyup event happens during a different window
//      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
//      window focus/blur events?

// TODO inject Movement
@TransientScope
@Inject(ActionManager, Body)
class PlayerActions {

  constructor(manager, body) {
    this.manager = manager;
    this.walkUp = Movement(body, 'up', {deltaY: -1});
    this.walkDown = Movement(body, 'down', {deltaY: 1});
    this.walkLeft = Movement(body, 'left', {deltaX: -1});
    this.walkRight = Movement(body, 'right', {deltaX: 1});
  }
}


@TransientScope
@Inject(PlayerActions)
@InjectLazy(ActionInputHelper)
function PlayerActionsDriver(actions, createActionInputHelper) {

  var inputHelper = createActionInputHelper(ActionManager, actions.manager);

  inputHelper.bind('Up', actions.walkUp);
  inputHelper.bind('Down', actions.walkDown);
  inputHelper.bind('Left', actions.walkLeft);
  inputHelper.bind('Right', actions.walkRight);
}


// TODO now i have to ensure this is SceneScope too, right? 
//      Chasing down all these dependencies is pretty confusing.
//      Maybe some sort of dependency graph analysis (static?) would
//      help catch errors.

@SceneScope
@Inject(Scene, Input, PlayerCoins, Renderer)
@InjectLazy(PlayerBody, PlayerActions, PlayerActionsDriver)
function PlayerLoader(scene, input, coins, renderer, createBody, createActions,
                      startDriver) {

  var layer = renderer.newLayer();

  return function(def, obj) {

    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
    };

    var g = renderer.createGraphic();
    g.beginFill(0xDDDDDD);
    g.drawRect(def.x, def.y, def.w, def.h);
    g.endFill();
    layer.addChild(g);

    obj.body = createBody('body-config', bodyConfig);
    obj.coins = coins;

    var actions = createActions(Body, obj.body);
    startDriver(PlayerActions, actions);

    scene.events.on('scene tick', function() {
      // TODO keydown? What if the player holds the key down?
      // TODO no long event
      if (input.event == 'Use keydown') {
        // TODO optimize?
        // TODO can only use one object?
        obj.body.queryFront().forEach((used) => {
          used.obj.events.trigger('use', [obj]);
        });
      }

      // TODO optimize, dirty checking
      layer.removeChild(g);
      var pos = obj.body.getRectangle();
      g = renderer.createGraphic();
      g.beginFill(0xDDDDDD);
      g.drawRect(pos.x, pos.y, pos.w, pos.h);
      g.endFill();
      layer.addChild(g);
    });

    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO PlayerCombat(keybindings, worldObj);
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?
  }
}
