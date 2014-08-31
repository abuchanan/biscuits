import {Provide, SuperConstructor} from 'di';
import {Input} from 'src/input';
import {Body, BodyConfig} from 'src/world';
import {Action, Movement, ActionManager, ActionInput} from 'src/Actions';
import {Scene} from 'src/scene';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {loadSpriteSheetSync} from 'src/sprite';
import PIXI from 'lib/pixi';
import {Types} from 'src/worldscene';
import {Loader} from 'src/utils';
import {ObjectConfig} from 'src/config';
import {Loadpoint} from 'src/loadpoints';
import {Sounds} from 'src/sounds';

export {
  CoinPurse,
};


@ObjectScope
@Provide(Body)
class PlayerBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    // TODO could use mixin(Body, BodyDirection)
    this.direction = 'down';
  }

  setPosition(x, y) {
    var blocks = this._isBlocked(x, y);

    if (blocks.length == 0) {
      super.setPosition(x, y);
      this._triggerCollisions();
    } else {
      for (var i = 0, ii = blocks.length; i < ii; i++) {
        blocks[i].events.trigger('player collision', [this]);
      }
      throw 'blocked';
    }
  }

  _isBlocked(x, y) {
    // TODO extract to world.containsBlock()?
    var rect = this.getRectangle();
    var bodies = this.world.query(x, y, rect.w, rect.h);
    var blocks = [];

    // Check if the next tile is blocked.
    for (var i = 0, ii = bodies.length; i < ii; i++) {
      if (bodies[i] !== this && bodies[i].isBlock) {
        blocks.push(bodies[i]);
      }
    }

    return blocks;
  }

  _triggerCollisions() {
    var rect = this.getRectangle();
    var bodies = this.world.query(rect.x, rect.y, rect.w, rect.h);

    for (var i = 0, ii = bodies.length; i < ii; i++) {
      if (bodies[i] !== this) {
        // TODO trigger events on body or body.obj?
        bodies[i].events.trigger('player collision', [this]);
      }
    }
  }
}


// TODO load player coins from game save service
// TODO basic validation/balance checking
// TODO move to coin plugin
@ObjectScope
class CoinPurse {

  constructor() {
    this._balance = 0;
  }

  // TODO needs type checking, should be integer
  //      best if it happens at compile time?
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
@ObjectScope
class PlayerActions {

  constructor(body: Body, sounds: Sounds) {
    // TODO using "new" here. Movement and Action should be injected
    this.walkUp = new Movement('walk-up', body, 'up', 0, -32, 250);
    this.walkDown = new Movement('walk-down', body, 'down', 0, 32, 250);
    this.walkLeft = new Movement('walk-left', body, 'left', -32, 0, 250);
    this.walkRight = new Movement('walk-right', body, 'right', 32, 0, 250);

    this.use = new UseAction(body);
    this.attack = new AttackAction(body, sounds);
  }
}


// TODO these don't fit with DI
class AttackAction extends Action {

  constructor(body, sounds) {
    var duration = 200;
    super(duration);
    this._body = body;
    this._sounds = sounds;
  }

  start(time, done) {
    super.start(time, done);

    console.log('attack!');
    this._sounds.swingSword.play();
    this._body.queryFront().forEach((hit) => {
      hit.events.trigger('hit', [this._body]);
    });
  }
}

class UseAction extends Action {

  constructor(body) {
    var duration = 1000;
    super(duration);
    this._body = body;
  }

  start(time, done) {
    super.start(time, done);

    // TODO optimize?
    // TODO can only use one object?
    this._body.queryFront().forEach((hit) => {
      hit.events.trigger('use', [this._body]);
    });
  }
}


@ObjectScope
function PlayerDriver(actions: PlayerActions, actionInput: ActionInput) {

  actionInput.bind('Up', actions.walkUp);
  actionInput.bind('Down', actions.walkDown);
  actionInput.bind('Left', actions.walkLeft);
  actionInput.bind('Right', actions.walkRight);
  actionInput.bind('Use', actions.use);
  actionInput.bind('Attack', actions.attack);
}


// TODO Chasing down scope dependencies is pretty confusing.
//      Maybe some sort of dependency graph analysis (static?) would
//      help catch errors.

    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    //      scene.loadDependsOn(loadPlayerTextures());
    // TODO PlayerCombat(keybindings, worldObj);
    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?


@ObjectScope
function PlayerRenderer(textures: PlayerTextures, body: Body,
                        actionManager: ActionManager, renderer: Renderer,
                        scene: Scene) {

  var layer = renderer.getLayer('player');
  var backgroundLayer = renderer.getLayer('background');
  var objectsLayer = renderer.getLayer('objects');

  // TODO wrap PIXI in an injectable that is not PIXI specific
  // TODO wouldn't work with multiple players. move into create function below
  var clip = new PIXI.MovieClip(textures['stop-down']);

  // TODO scale player sprite images in actual image file
  clip.width = body.w;
  clip.height = body.h;
  // TODO base animationSpeed on movement speed definitions
  clip.animationSpeed = 0.1;
  layer.addChild(clip);

  // TODO clean up renderer.renderer
  clip.position.x = renderer.renderer.width / 2;
  clip.position.y = renderer.renderer.height / 2;

  scene.events.on('tick', function(time) {
    var state = actionManager.getState();

    // TODO try to remove this stop special case. Maybe actions should be
    //      DFAs. After each walk action, it would move to a "stop-{direction"
    //      state.
    //      This would allow a nice action/DFA modeling tool too.
    //
    //      Something to ask: how would concurrent actions/states be handled?

    // TODO maybe the renderer could hook in via some sort of action tick event.
    //      then it wouldn't need to depend on tick, it wouldn't need
    //      interpolatePosition, 
    if (state.action == 'stop') {

      var pos = body.getPosition();
      objectsLayer.x = (objectsLayer.width / 2) - pos.x;
      objectsLayer.y = (objectsLayer.height / 2) - pos.y;
      backgroundLayer.x = (backgroundLayer.width / 2) - pos.x;
      backgroundLayer.y = (backgroundLayer.height / 2) - pos.y;

      var textureName = 'stop-' + body.direction;
      clip.textures = textures[textureName];
      clip.gotoAndStop(0);

    } else {

      // TODO need a way to split up the rendering of various movements
      //      into discrete pieces. i.e. make action/movement rendering
      //      pluggable
      if (state.action instanceof Movement) {
        var textureName = state.action.name;
        clip.textures = textures[textureName];

        var pos = state.action.interpolatePosition();
        objectsLayer.x = Math.floor((objectsLayer.width / 2) - pos.x);
        objectsLayer.y = Math.floor((objectsLayer.height / 2) - pos.y);
        backgroundLayer.x = Math.floor((backgroundLayer.width / 2) - pos.x);
        backgroundLayer.y = Math.floor((backgroundLayer.height / 2) - pos.y);

        clip.play();
      }
    }
  });
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

@ObjectScope
function setupBodyConfig(loadpoint: Loadpoint, bodyConfig: BodyConfig) {
  console.log('loadpoint', loadpoint);
  bodyConfig.x = loadpoint.playerConfig.x;
  bodyConfig.y = loadpoint.playerConfig.y;
  // TODO don't hard code player dimensions?
  bodyConfig.w = 32;
  bodyConfig.h = 32;
}


@ObjectScope
function setupSounds(sounds: Sounds) {
  sounds.swingSword = sounds.create({
    urls: ['media/sounds/swings.wav'],
  });
}

Types['player'] = Loader()
  .provides(PlayerBody)
  .runs([
    setupBodyConfig,
    setupSounds,
    // TODO wow, fuck. that was a confusing bug to track down.
    //      which is becoming typical of di.js. If s/Body/PlayerBody/
    //      then the PlayerBody constructor is called twice....
    //      Is this a bug with di.js? Maybe it should use the @Provided
    //      token? Or, injector.get() should require an interface?
    //
    //      Or, maybe I should give up this idea that it's better to use
    //      symbols than strings. I don't really care about the minification
    //      savings and it'd probably make my code more concise and avoid
    //      issues with missing imports.
    Body,
    PlayerDriver,
    PlayerRenderer,
    CoinPurse,
  ]);


// TODO maybe di.js could attach its get() function to the function/class
//      in order to improve the debugging experience? The call stack isn't
//      very readable when there a bunch of get(), create(), etc... lines
