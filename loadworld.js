

function PortalService(player, world, sceneManager, container) {

  // Portal handling
  // TODO player jumps through portal with the slightest overlap.
  //      would be nicer to wait until the player is overlapping more
  //      so it feels like you're *in* the portal
  world.contactListener(player, function(fixture) {
    var data = fixture.objectData;
    if (data.isPortal) {
      data.loadDestination.call(data);
    }
  });

  return {
    create: function(dest, x, y, w, h) {

        var g = new PIXI.Graphics();
        g.beginFill(0x00ffaa);
        g.drawRect(0, 0, w, h);
        g.endFill();

        g.position.x = x;
        g.position.y = y;

        var portal = {
          destination: dest,
          isPortal: true,
          loadDestination: function() {
            sceneManager.load(this.destination);
          },
        };

        world.addSensor(portal, x, y, w, h);
        container.addChild(g);

        return portal;
    },
  }
}

function ChestService(player, world, container) {
  return {
    create: function(x, y, w, h) {

      var g = new PIXI.Graphics();
      g.beginFill(0x00FFFF);
      g.drawRect(0, 0, w, h);
      g.endFill();

      g.position.x = x;
      g.position.y = y;

      var chest = {
        chest: true,
        useable: true,
        use: function() {
          g.clear();
          g.beginFill(0x0000FF);
          g.drawRect(0, 0, w, h);
          g.endFill();

          player.coins += 5;
        },
      };

      world.addStatic(chest, x, y, w, h);
      container.addChild(g);

      return chest;
    }
  }
}

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

function Useable(player, world) {
  return function(eventname) {
      if (eventname == 'Use keydown') {
        var pos = player.getPosition();

        switch (player.getDirection()) {
          case 'up':
            var x1 = pos.x;
            var y1 = pos.y - 10;
            var x2 = pos.x + 32;
            var y2 = pos.y;
            break;

          case 'down':
            var x1 = pos.x;
            var y1 = pos.y + 32;
            var x2 = pos.x + 32;
            var y2 = pos.y + 32 + 10;
            break;

          case 'left':
            var x1 = pos.x - 10;
            var y1 = pos.y;
            var x2 = pos.x;
            var y2 = pos.y + 32;
            break;

          case 'right':
            var x1 = pos.x + 32;
            var y1 = pos.y;
            var x2 = pos.x + 32 + 10;
            var y2 = pos.y + 32;
            break;
        }
        var res = world.query(x1, y1, x2, y2);

        // TODO this could affect multiple objects. only want to affect one.
        for (var i = 0; i < res.length; i++) {
          var obj = res[i][2];
          if (obj.useable) {
            obj.use();
          }
        }
      }
  }
}

function Combat(player, world) {

  var damage = 1;

  return function(eventname) {
    if (eventname == 'Sword keydown') {
      var pos = player.getPosition();

        // TODO duplicated with Useable
        switch (player.getDirection()) {
          case 'up':
            var x1 = pos.x;
            var y1 = pos.y - 10;
            var x2 = pos.x + 32;
            var y2 = pos.y;
            break;

          case 'down':
            var x1 = pos.x;
            var y1 = pos.y + 32;
            var x2 = pos.x + 32;
            var y2 = pos.y + 32 + 10;
            break;

          case 'left':
            var x1 = pos.x - 10;
            var y1 = pos.y;
            var x2 = pos.x;
            var y2 = pos.y + 32;
            break;

          case 'right':
            var x1 = pos.x + 32;
            var y1 = pos.y;
            var x2 = pos.x + 32 + 10;
            var y2 = pos.y + 32;
            break;
        }
        var res = world.query(x1, y1, x2, y2);

        // TODO manage whether multiple objects can be hit
        for (var i = 0; i < res.length; i++) {
          var obj = res[i][2];
          if (obj.hittable) {
            obj.hit(damage);
          }
        }
    }
  }
}


function loadWorld(mapfile, sceneManager, container) {

  var reqs = [
    loadMap(mapfile),
  ];

  // TODO need to rethink async resource loading. PIXI changed the game,
  //      I'm not sure if it's synchronous or not, etc. 
  return Q.spread(reqs, function(map) {

    var keybindings = KeyBindingsService();

    /*
    The physics world and the renderer use a different scale.

    Box2D (the physics engine) recommends a scale (meters) that doesn't match
    the renderer's scale (pixels). Because of this, we have to convert between
    the two scales, which (unfortunately) shows a bit here in this code.

    TODO clean this up and try to completely encapsulate the
         scale within World.
    */
    // TODO better encapsulate player API. Shouldn't expose clip, clip should
    //      be modified internally through calls like player.walk('left'),
    //      (or something) and player should be renderable?
    // TODO 32 is hard-coded
    var scale = 32;
    var world = World(scale);

    // TODO clean up layering code.
    var backgroundLayer = new PIXI.DisplayObjectContainer();
    container.addChild(backgroundLayer);

    // TODO maybe loadpoint from Tiled should determine layer?
    var playerLayer = new PIXI.DisplayObjectContainer();
    container.addChild(playerLayer);

    var statusLayer = new PIXI.DisplayObjectContainer();
    container.addChild(statusLayer);

    var playerCoinCountText = new PIXI.Text('');
    statusLayer.addChild(playerCoinCountText);

    var player = Player(world, playerLayer, keybindings, 32, 32);

    var useable = Useable(player, world);
    // TODO we pass keybindings to player but bind externally here
    keybindings.listen(useable);

    var combat = Combat(player, world);
    keybindings.listen(combat);

    var Portals = PortalService(player, world, sceneManager, container);
    var Chests = ChestService(player, world, container);
    var Squirrels = SquirrelService(world, container);
    var Coins = CoinsService(player, world, container);

    // TODO need dynamic view size
    var viewW = 640;
    var viewH = 640;
    //var viewW = 320;
    //var viewH = 320;
    WorldView(world, container, player, viewW, viewH, scale);

    function makeScene(playerX, playerY, playerDirection, viewX, viewY) {
        return function() {
            container.visible = true;
            keybindings.enable();

            container.x = viewX;
            container.y = viewY;

            player.setDirection(playerDirection);

            // TODO before I had world.start() *before* this line,
            //      which is the wrong order, and only didn't fail because
            //      of the 15 ms interval time. Things like this need to happen
            //      outside of a world step, which is an important reason to 
            //      build good encapsulation for box2d.
            player.setPosition(playerX, playerY);

            world.start();
            // TODO container.width = 32 * 8;

            // return unload function
            return function() {
              world.stop();
              // TODO sceneManager should handle removing the containers from
              //      the master container?
              container.visible = false;
              keybindings.disable();
            }
        }
    }

    // TODO do i really want these split? probably not
    for (var layer_i = 0; layer_i < map.tilelayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.tilelayers[layer_i].length; obj_i++) {
        var obj = map.tilelayers[layer_i][obj_i];
        backgroundLayer.addChild(obj);
      }
    }

    for (var layer_i = 0; layer_i < map.objectlayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.objectlayers[layer_i].length; obj_i++) {
        var obj = map.objectlayers[layer_i][obj_i];

        if (obj.isBlock) {
          world.addStatic(obj, obj.x, obj.y, obj.w, obj.h);
        }

        // TODO use type
        // TODO but what if multiple types?
        else if (obj.portal) {
          Portals.create(obj.portal, obj.x, obj.y, obj.w, obj.h);
        }

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


function CoinsService(player, world, container) {

  // Coin handling
  world.contactListener(player, function(fixture) {
    if (fixture.objectData.coin) {
        fixture.objectData.use();
        world.remove(fixture);
    }
  });

  return {
    create: function(x, y, w, h) {
      var value = 1;

      var g = new PIXI.Graphics();
      g.beginFill(0xF0F074);
      g.drawRect(0, 0, w, h);
      g.endFill();

      g.position.x = x;
      g.position.y = y;

      var coin = {
        coin: true,
        use: function() {
          container.removeChild(g);
          player.coins += value;
        },
      };

      world.addStatic(coin, x, y, w, h);
      container.addChild(g);
    }
  }
}
