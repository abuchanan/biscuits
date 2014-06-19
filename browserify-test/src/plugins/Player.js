import {Inject, InjectLazy, TransientScope} from 'di';
import {Body} from 'src/world';
import {Input} from 'src/input';
import {Movement, ActionManager, ActionInputHelper} from 'src/Actions';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Renderer} from 'src/render';
import {loadSpriteSheetSync} from 'src/sprite';
import PIXI from 'lib/pixi';

export {PlayerLoader, PlayerCoins};


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
    this.walkUp = Movement('walk-up', body, 'up', {deltaY: -32});
    this.walkDown = Movement('walk-down', body, 'down', {deltaY: 32});
    this.walkLeft = Movement('walk-left', body, 'left', {deltaX: -32});
    this.walkRight = Movement('walk-right', body, 'right', {deltaX: 32});
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
@Inject(Scene, Input, PlayerCoins, PlayerRenderer)
@InjectLazy(PlayerBody, PlayerActions, PlayerActionsDriver)
function PlayerLoader(scene, input, coins, initPlayerRenderer, createBody, createActions,
                      startDriver) {

  return function(def, obj) {

    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
    };

    // TODO replace this convention with an injector per world object?
    obj.body = createBody('body-config', bodyConfig);
    obj.coins = coins;

    var actions = createActions(Body, obj.body);
    startDriver(PlayerActions, actions);

    initPlayerRenderer(obj.body, actions);

    scene.events.on('scene tick', function() {
      // TODO keydown? What if the player holds the key down?
      // TODO no longer "input.event" instead "input.Up"
      if (input.event == 'Use keydown') {
        // TODO optimize?
        // TODO can only use one object?
        obj.body.queryFront().forEach((used) => {
          used.obj.events.trigger('use', [obj]);
        });
      }
    });

    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO PlayerCombat(keybindings, worldObj);
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?
  }
}

/* TODO can't complete this until background region is injectable, player is injectable,
        which means erradicating InjectLazy locals use.
*/
@Inject(Renderer, Scene)
function PlayerWorldViewRenderer(renderer, scene) {
  return function(body, actions) {

    // TODO make this more flexible
    var backgroundLayer = renderer.getLayer('background');
    var objectsLayer = renderer.getLayer('objects');

    scene.events.on('scene tick', function() {
    });
  };
}


// TODO @InjectPromise(PlayerTextures) ?
@SceneScope
@Inject(PlayerTextures, Renderer, Scene)
function PlayerRenderer(textures, renderer, scene) {

  var layer = renderer.getLayer('player');

  // TODO wrap PIXI in an injectable that is not PIXI specific
  // TODO wouldn't work with multiple players. move into create function below
  var clip = new PIXI.MovieClip(textures['stop-down']);

  return function(body, actions) {

    // TODO scale player sprite images in actual image file
    clip.width = body.w;
    clip.height = body.h;
    // TODO base animationSpeed on movement speed definitions
    clip.animationSpeed = 0.1;
    layer.addChild(clip);

    scene.events.on('scene tick', function(time) {
      var state = actions.manager.getState();

      // TODO try to remove this stop special case. Maybe actions should be
      //      DFAs. After each walk action, it would move to a "stop-{direction"
      //      state.
      //      This would allow a nice action/DFA modeling tool too.
      //
      //      Something to ask: how would concurrent actions/states be handled?

      // TODO maybe the renderer could hook in via some sort of action tick event.
      //      then it wouldn't need to depend on scene tick, it wouldn't need
      //      interpolatePosition, 
      if (state.action == 'stop') {

        var pos = body.getPosition();
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        var textureName = 'stop-' + body.direction;
        clip.textures = textures[textureName];
        clip.gotoAndStop(0);

      } else {

        var textureName = state.action.name;
        clip.textures = textures[textureName];

        var pos = state.action.interpolatePosition(state.percentComplete);
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        clip.play();
      }
    });
  };
}

function PlayerTextures() {
  var imgSrc = "media/player-pieces.png";
  var jsonSrc = "media/player-pieces.json";

  // TODO re-implement async handling
  var parts = loadSpriteSheetSync(imgSrc, jsonSrc);

  // TODO define this stuff in JSON. build a tool to help build these texture packs.
  return {
    'stop-up': [
      parts['up-0'],
    ],
    'stop-down': [
      parts['down-0'],
    ],
    'stop-left': [
      parts['left-0'],
    ],
    'stop-right': [
      parts['right-0'],
    ],
    'walk-up': [
      parts['up-0'],
      parts['up-1'],
      parts['up-2'],
      parts['up-3'],
      parts['up-4'],
    ],
    'walk-down': [
      parts['down-0'],
      parts['down-1'],
      parts['down-2'],
      parts['down-3'],
      parts['down-4'],
    ],
    'walk-right': [
      parts['right-0'],
      parts['right-1'],
      parts['right-2'],
      parts['right-1'],
      parts['right-3'],
    ],
    'walk-left': [
      parts['left-0'],
      parts['left-1'],
      parts['left-2'],
      parts['left-1'],
      parts['left-3'],
    ],
    'sword-up': [
      parts['sword-up-0'],
    ],
    'sword-down': [
      parts['sword-down-0'],
    ],
    'sword-left': [
      parts['sword-left-0'],
    ],
    'sword-right': [
      parts['sword-right-0'],
    ],
  };
}
