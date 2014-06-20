import {Provide, SuperConstructor} from 'di';
import {Movement, ActionManager} from 'src/Actions';
import {Scene} from 'src/scene';
import {ObjectScope} from 'src/scope';
import {loadSpriteSheetSync} from 'src/sprite';
import {Renderer} from 'src/render';
import PIXI from 'lib/pixi';
import {Body} from 'src/world';

export {
  SquirrelBody,
  SquirrelActions,
  SquirrelDriver,
  SquirrelRenderer
}


// TODO does this trash all inherited annotations?
//      Yes. sucky poo poo.
//
//      this could be a really interesting case to bring up with di.js
//
//      this also clobbers the @ObjectScope. also poop.
@ObjectScope
@Provide(Body)
class SquirrelBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    // TODO could use mixin(Body, BodyDirection)
    this.direction = 'down';
  }
}


@ObjectScope
class SquirrelActions {

  constructor(manager: ActionManager, body: Body) {
    this.manager = manager

    this.walkUp = new Movement('walk-up', body, 'up', 0, -32, 250);
    this.walkDown = new Movement('walk-down', body, 'down', 0, 32, 250);
    this.walkLeft = new Movement('walk-left', body, 'left', -32, 0, 250);
    this.walkRight = new Movement('walk-right', body, 'right', 32, 0, 250);
  }
}
// TODO sporadic animation. a squirrel isn't a fluid animation loop.


@ObjectScope
function SquirrelDriver(scene: Scene, actions: SquirrelActions) {

    // TODO I think that simplicity in destroying an object is really interesting,
    //      particularly when it comes to callback functions like this. Currently,
    //      an object needs to register a callback function. If the squirrel was
    //      destroyed by some other plugin/method, it would need to signal this
    //      plugin to deregister itself. If you forgot to code deregister everything
    //      correctly (arguably, easy to do!) bad, things could happen (very subtly).
    //      It'd be better if nothing held onto any part of the destroyable object.
    //      When the object is gone, all its ties are gone automatically.
    //
    //      For this app, possibly this could come in the form of an Update() method,
    //      which can be returned by any plugin. The SceneManager can look for these
    //      hooks.
    //
    //      Or, if every object gets an injector, then every object can get an 
    //      object-specific events bus. When the object tells the Scene that it wants
    //      to destroy itself, the events bus will go with it. This could also have
    //      a nice effect on the input event api.
    //
    //      On the other hand, it's difficult to magically remove a body from the world
    //      when the object is destroyed. That feels like something the absolutely 
    //      requires a "destory" hook, although this could be built into Body so that
    //      everyone gets it for free.
    //
    //      Could also consider using something like WeakMap to track event listeners?
    //      Won't have reasonable browser support for a long time though.
    var noop = function() {};
    var choices = [
      actions.walkUp,
      actions.walkDown,
      actions.walkLeft,
      actions.walkRight,
    ];

    scene.events.on('scene tick', function() {
      var state = actions.manager.getState();

      if (state.action == 'stop') {
        if (Math.random() > 0.95) {
          var i = Math.floor(Math.random() * choices.length);
          var move = choices[i];
          actions.manager.start(move);
        } else {
          actions.manager.stopAll();
        }
      } else {
        actions.manager.stopAll();
      }
    });
}


// TODO gosh it would be nice not to have to prefix everything with "Squirrel"

    // TODO squirrels can be destroyed which is an interesting case where an object
    //      need to destroy itself.
    //
    //      I'm pretty sure this is an important case for why every object needs
    //      its own injector, otherwise, how would you destroy all the dependencies of
    //      that object?
    /* TODO
      destroy: function() {
        body.remove();
        destroyRenderer();
        pathfinder.stop();
      },
    */


function SquirrelTextures() {

    var imgSrc = "media/squirrel-pieces.png";
    var jsonSrc = "media/squirrel-pieces.json";

    var parts = loadSpriteSheetSync(imgSrc, jsonSrc);

    function getSequence(prefix, length) {
      var seq = [];
      for (var i = 0; i < length; i++) {
        var name = prefix + '-' + i;
        seq.push(parts[name]);
      }
      return seq;
    }

    return {
      'idle-up': getSequence('idle-up', 8),
      'idle-down': getSequence('idle-down', 8),
      'idle-left': getSequence('idle-left', 8),
      'idle-right': getSequence('idle-right', 8),
      'walk-up': getSequence('move-up', 3),
      'walk-down': getSequence('move-down', 3),
      'walk-left': getSequence('move-left', 3),
      'walk-right': getSequence('move-right', 3),
    };
}


// TODO I forget this ALL THE TIME! (scope annotation)
@ObjectScope
function SquirrelRenderer(textures: SquirrelTextures, renderer: Renderer,
                          scene: Scene, body: Body, actions: SquirrelActions) {

  var layer = renderer.getLayer('objects');

    var clip = new PIXI.MovieClip(textures['idle-left']);
    clip.width = body.w;
    clip.height = body.h;
    // TODO configurable
    // TODO make match action duration
    clip.animationSpeed = 0.07;
    clip.play();

    layer.addChild(clip);

    // TODO need deregistration function
    scene.events.on('scene tick', function() {
      var state = actions.manager.getState();

      // TODO exactly same code as player renderer. DRY
      if (state.action == 'stop') {
        var pos = body.getPosition();
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        var textureName = 'idle-' + body.direction;
        clip.textures = textures[textureName];
        clip.play();

      } else {

        var textureName = state.action.name;
        clip.textures = textures[textureName];

        var pos = state.action.interpolatePosition();
        clip.position.x = pos.x;
        clip.position.y = pos.y;

        clip.play();
      }

    });
}


// TODO this is all one big hack!
// TODO and not it's likely a big broken hack, since I've moved it. fix this!
/*
function Pathfinder(squirrel) {
    var movement = squirrel.getMovementHandler();
    var checkInterval;
    var maxPath = 10;

    function nextMove() {

      var pos = squirrel.getPosition();

      // TODO query world for nearest player then use that to make the path
      //var playerPos = player.getPosition();
      var path = world.findPath(pos.x, pos.y, playerPos.x, playerPos.y);

      if (path.length > 1 && path.length < maxPath) {
        clearInterval(checkInterval);
        checkInterval = false;

        var dx = path[1][0] - pos.x;
        var dy = path[1][1] - pos.y;

        // TODO need to figure out how to integrate this cleanly with MovementHandler
        if (dy == -1) {
          movement.start(squirrel.moveUp);
        } else if (dy == 1) {
          movement.start(squirrel.moveDown);
        } else if (dx == -1) {
          movement.start(squirrel.moveLeft);
        } else if (dx == 1) {
          movement.start(squirrel.moveRight);
        }

      } else {
          movement.stopAll();

          if (!checkInterval) {
            checkInterval = setInterval(nextMove, 500);
          }
      }
    }

    // TODO
    squirrel.moveUp.endCallback = nextMove;
    squirrel.moveDown.endCallback = nextMove;
    squirrel.moveLeft.endCallback = nextMove;
    squirrel.moveRight.endCallback = nextMove;
}
*/
