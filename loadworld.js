
function loadStage(sceneManager, container) {
  return Q.fcall(function() {
    sceneManager.addScene('stage', function() {
      container.visible = true;

      console.log('load stage');

      var g = new PIXI.Graphics();
      g.beginFill(0x00ffaa);
      g.drawRect(0, 0, 100, 100);
      g.endFill();

      container.addChild(g);

      return function() {
        container.visible = false;
      }
    });
  });
}


function loadWorld(mapfile, sceneManager, container) {
  // TODO use PIXI SpriteBatch?
  var scale = 16;

  var reqs = [
    loadMap(mapfile, scale),
  ];

  // TODO need to rethink async resource loading. PIXI changed the game,
  //      I'm not sure if it's synchronous or not, etc. 
  return Q.spread(reqs, function(map) {

    var keybindings = KeyBindingsService();

    // TODO
    var size = 32 / scale * map.mapData.width;
    var world = World(size, size);

    var worldViewLayer = container.newLayer();
    var backgroundLayer = worldViewLayer.newLayer();
    // TODO maybe loadpoint from Tiled should determine layer?
    var objectLayer = worldViewLayer.newLayer();
    var playerLayer = worldViewLayer.newLayer();

    objectLayer.scale.x = scale;
    objectLayer.scale.y = scale;
    playerLayer.scale.x = scale;
    playerLayer.scale.y = scale;

    var statusLayer = container.newLayer();

    // TODO should player w/h be dynamic?
    //      at least 32 should no be hard-coded
    var player = Player(world, keybindings, 32 / scale, 32 / scale);

    PlayerRenderer(player, playerLayer);

    StatusLayerRenderer(player, container);

    var useable = Useable(player, world);
    // TODO we pass keybindings to player but bind externally here
    keybindings.listen(useable);

    container.addFrameListener(function() {
      var state = player.getMovementState();
      var percentComplete = state.getPercentComplete();
      var pos = state.getPositionAt(percentComplete);

      // TODO hardcoded dimensions
      worldViewLayer.x = 320 - Math.floor(pos.x * scale);
      worldViewLayer.y = 320 - Math.floor(pos.y * scale);
    });

    var combat = Combat(player, world);
    keybindings.listen(combat);

    // TODO I kind of want to ditch portals as much as possible,
    //      give everything a very fluid feeling. when are they absolutely
    //      necessary?
    //var Portals = PortalService(player, world, sceneManager, objectLayer);
    var Chests = ChestService(player, world, objectLayer);
    var Squirrels = SquirrelService(world, player, objectLayer);
    var Coins = CoinsService(player, world, objectLayer);

    function makeScene(playerX, playerY, playerDirection, viewX, viewY) {
        return function() {
            container.visible = true;
            keybindings.enable();

            player.setDirection(playerDirection);
            player.setPosition(playerX, playerY);

            // TODO load order is tricky. if this is called before the player
            //      position is set, then everything is broken
            Squirrels.start();

            // return unload function
            return function() {
              world.stop();
              // TODO sceneManager should handle removing the containers from
              //      the master container?
              //      But what if the scene doesn't have a PIXI renderer?
              //      They why pass in container?
              container.visible = false;
              keybindings.disable();
            }
        }
    }

    // TODO do i really want these split? probably not
    for (var layer_i = 0; layer_i < map.tilelayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.tilelayers[layer_i].length; obj_i++) {
        var obj = map.tilelayers[layer_i][obj_i];
        // TODO need a background manager so we can lazy load things offscreen
        backgroundLayer.addChild(obj);
      }
    }

    for (var layer_i = 0; layer_i < map.objectlayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.objectlayers[layer_i].length; obj_i++) {
        var obj = map.objectlayers[layer_i][obj_i];

        if (obj.isBlock) {
          var obj = world.add(obj.x, obj.y, obj.w, obj.h);
          obj.isBlock = true;
        }

        /*
        // TODO use type
        // TODO but what if multiple types?
        else if (obj.portal) {
          Portals.create(obj.portal, obj.x, obj.y, obj.w, obj.h);
        }
        */

        else if (obj.type == 'loadpoint') {
          // TODO better default than 0, like center player in view
          var viewX = obj.viewX || 0;
          var viewY = obj.viewY || 0;
          var direction = obj.playerDirection || 'down';
          var load = makeScene(obj.x, obj.y, direction, viewX, viewY);

          sceneManager.addScene(obj.name, load);
        }

        else if (obj.type == 'squirrel') {
          Squirrels.create(obj.x, obj.y, obj.w, obj.h);
        }

        else if (obj.type == 'coin') {
          Coins.create(obj.x, obj.y, obj.w, obj.h);
        }

        else if (obj.type == 'chest') {
          Chests.create(obj.x, obj.y, obj.w, obj.h);
        }
      }
    }
  });
}
