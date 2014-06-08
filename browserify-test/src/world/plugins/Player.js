import {Movement, Manager, KeysHelper} from 'src/Actions';
import {BlockableMovement} from 'src/BlockableMovement';
module Body from 'src/Body';
module ObjectLoader from 'src/ObjectLoader';

ObjectLoader.events.on('load player', loadPlayerObject);

function loadPlayerObject(def, obj, scene) {
    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    // scene.loadDependsOn(loadPlayerTextures());

    // TODO overload world.add to accept object with these keys
    // TODO use MovingBody(...) instead? i.e. create a body and pass
    //      it to the world, rather than have the world create the body?
    var body = scene.world.add(def.x, def.y, def.w, def.h);

    Body.mixinDirection(body);

    obj.body = PositionChangeEvent(body);
    obj.body = BlockableMovement(body, scene.world);
    obj.coins = PlayerCoins();

    PlayerMovement(scene.events, body);
    PlayerCollision(obj, scene.world);

    // TODO PlayerCombat(keybindings, worldObj);

    // TODO player use key and world event

    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?
}

function PositionChangeEvent(body) {
  var origSetPosition = body.setPosition;

  body.setPosition = function(x, y) {
    origSetPosition(x, y);
    body.events.trigger('position changed', [x, y]);
  };

  return body;
}


function PlayerCollision(player, world) {
  var playerBody = player.body;

  playerBody.events.on('position changed', function() {
    var rect = playerBody.getRectangle();

    var objs = world.query(rect.x, rect.y, rect.w, rect.h);

    for (var i = 0, ii = objs.length; i < ii; i++) {
      if (objs[i] !== playerBody) {
        objs[i].events.trigger('player collision', [player]);
      }
    }

    // TODO? world.broadcast('player collision', rect, [body]);
    //       or body.broadcast('player collision');
  });
}

function PlayerCoins() {
  // TODO load player coins from game save service
  // TODO basic validation/balance checking
  var balance = 0;
  return {
    deposit: function(val) {
      balance += val;
    },
    spend: function(val) {
      balance -= val;
    },
    balance: function() {
      return balance;
    }
  };
}


// TODO when keyup event happens during a different window
//      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
//      window focus/blur events?


function PlayerMovement(events, body) {
  var walkUp = Movement(body, 'up', {deltaY: -1});
  var walkDown = Movement(body, 'down', {deltaY: 1});
  var walkLeft = Movement(body, 'left', {deltaX: -1});
  var walkRight = Movement(body, 'right', {deltaX: 1});

  var manager = Manager();
  events.on('scene tick', manager.tick);
  var keysHelper = KeysHelper(manager, events);

  keysHelper.bind('Up', walkUp);
  keysHelper.bind('Down', walkDown);
  keysHelper.bind('Left', walkLeft);
  keysHelper.bind('Right', walkRight);
}
