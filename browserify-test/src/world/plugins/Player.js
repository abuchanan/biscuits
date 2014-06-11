import {Inject, InjectLazy, TransientScope} from 'di';
import {Body, World} from 'src/world';
import {EventEmitter} from 'src/events';
import {Movement, Manager, KeysHelper} from 'src/Actions';
import {factory} from 'src/utils';
import {KeyEvents} from 'src/keyevents';
import {SceneScope, Scene} from 'src/scene';

export {PlayerLoader};


@TransientScope
@Inject(EventEmitter, World, 'body-config')
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

// TODO possible to say "if you depend on something with SceneScope,
//      then you are automatically also SceneScope"?
@SceneScope
@Inject(KeyEvents, Scene)
function PlayerMovement(keyevents, scene) {
  return function(body) {
    var walkUp = Movement(body, 'up', {deltaY: -1});
    var walkDown = Movement(body, 'down', {deltaY: 1});
    var walkLeft = Movement(body, 'left', {deltaX: -1});
    var walkRight = Movement(body, 'right', {deltaX: 1});

    var manager = Manager();
    // TODO move this into the manager
    scene.events.on('scene tick', manager.tick);
    var keysHelper = KeysHelper(manager, keyevents);

    keysHelper.bind('Up', walkUp);
    keysHelper.bind('Down', walkDown);
    keysHelper.bind('Left', walkLeft);
    keysHelper.bind('Right', walkRight);
  }
}


// TODO if loading multiple players (which is currently outside the scope
//      of this game) this would fail because it would give every player
//      the same coins instance
// TODO now i have to ensure this is SceneScope too, right? 
//      Chasing down all these dependencies is pretty confusing.
//      Maybe some sort of dependency graph analysis (static?) would
//      help catch errors.
// TODO test and pull request for stackable @Inject annotations
//function PlayerLoader(coins, playerMovement, @InjectLazy(PlayerBody) createPlayerBody) {

@SceneScope
@Inject(KeyEvents, PlayerCoins, PlayerMovement)
@InjectLazy(PlayerBody)
function PlayerLoader(keyEvents, coins, playerMovement, createPlayerBody) {
  return function(def, obj) {
    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
    };

    obj.body = createPlayerBody('body-config', bodyConfig);
    //new PlayerBody(def.x, def.y, def.w, def.h, obj);
    obj.coins = coins;

    playerMovement(obj.body);

    // TODO keydown? What if the player holds the key down?
    keyEvents.on('Use keydown', function() {
      // TODO optimize?
      obj.body.queryFront().forEach((used) => {
        used.obj.events.trigger('use', [obj]);
      });
    });

    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO PlayerCombat(keybindings, worldObj);
    // TODO player use key and world event
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?
  }
}

//console.log(PlayerLoader.annotations);
//console.log(PlayerLoader.parameters);
