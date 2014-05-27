'use strict';

var Actions = require('src/Actions');
var Movement = Actions.Movement;
var _ = require('underscore');

exports.registerWorldLoaderPlugin = function(loader) {

  loader.events.addListener('load player', function(obj, scene) {

    // TODO mechanism for telling scene that it needs to wait on a promise
    //      when loading
    scene.loadDependsOn(loadPlayerTextures());

    // TODO overload world.add to accept object with these keys
    var worldObj = scene.world.add(obj.x, obj.y, obj.w, obj.h);

    _.extend(worldObj,
      PlayerCoins(),
      BlockableMovement(worldObj, scene.world)
    );

    PlayerMovement(scene.events, worldObj);
    PlayerCollision(worldObj, scene.world);

    // TODO PlayerCombat(keybindings, worldObj);

    // TODO player use key and world event

    // TODO how to allow player to move and swing sword at same time?
    //      how to coordinate separate action manager with the renderer?
  });
};


function PlayerCollision(worldObj, world) {
  worldObj.events.on('position changed', function() {
    // TODO or worldObj.broadcast('player collision');
    var rect = worldObj.getRectangle();
    world.broadcast('player collision', rect, [worldObj]);
  });
}

function PlayerCoins(obj) {
  // TODO load player coins from game save service
  // TODO accessor methods. add/take, credit/debit, or something.
  return {
    coins: 0
  };
}


// TODO when keyup event happens during a different window
//      e.g. keydown, cmd+tab away, let go of key, then cmd+tab back
//      window focus/blur events?


function BlockableMovement(worldObj, world) {

  return {
    setPosition: function(x, y) {
      // TODO extract to world.containsBlock()?
      var objs = world.query(x, y, worldObj.w, worldObj.h);

      // Check if the next tile is blocked.
      var blocked = false;
      for (var i = 0, ii = objs.length; i < ii; i++) {
        if (objs[i] !== worldObj && objs[i].isBlock) {
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        worldObj.setPosition(x, y);
        // TODO include position in event data
        // TODO extract. make available on all world objects.
        // events.fire('position changed');
      }
    }
  };
}

function PlayerMovement(events, worldObj) {

  var walkUp = Movement(worldObj, 'up', {deltaY: -1});
  var walkDown = Movement(worldObj, 'down', {deltaY: 1});
  var walkLeft = Movement(worldObj, 'left', {deltaX: -1});
  var walkRight = Movement(worldObj, 'right', {deltaX: 1});

  var manager = Actions.Manager();
  var keysHelper = Actions.KeysHelper(manager, events);

  keysHelper.bind('Up', walkUp);
  keysHelper.bind('Down', walkDown);
  keysHelper.bind('Left', walkLeft);
  keysHelper.bind('Right', walkRight);
}
