function CoinsService() {
  return {
    create: function() {

      var g = new PIXI.Graphics();
      g.beginFill(0xF0F074);
      // TODO how to create graphics without worrying about scale?
      g.drawRect(0, 0, 32, 32);
      g.endFill();

      return {
        clip: g,
        coin: true,
      }
    }
  }
}

function ChestService() {
  return {
    create: function() {

      var g = new PIXI.Graphics();
      g.beginFill(0x00FFFF);
      // TODO how to create graphics without worrying about scale?
      g.drawRect(0, 0, 32, 32);
      g.endFill();

      return {
        clip: g,
        chest: true,
        open: function(player) {
          g.clear();
          g.beginFill(0x0000FF);
          // TODO how to create graphics without worrying about scale?
          g.drawRect(0, 0, 32, 32);
          g.endFill();

          player.coins += 5;
        },
      }
    }
  }
}

function loadStage(sceneManager, container) {
  return Q.fcall(function() {
    sceneManager.addScene('stage', function() {
      container.visible = true;
      container.

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

  var Coins = CoinsService();
  var Chests = ChestService();

  var reqs = [
    Player(),
    SquirrelService(),
    loadMap(mapfile),
  ];

  return Q.spread(reqs, function(player, Squirrel, map) {
    // TODO this function is getting huge and unmanagable.
    //      needs to be cut up into modular handlers

    // TODO maybe loadpoint from Tiled should determine layer?
    var keybindings = KeyBindingsService();

    var playerCoinCountText = new PIXI.Text('');

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
    var scale = 32;
    var world = World(scale);

    var playerW = player.clip.width;
    var playerH = player.clip.height;

    var playerFixture = world.addDynamic(player, 0, 0, playerW, playerH);
    var body = playerFixture.GetBody();

    var movement = MovementHandler(body, {
      onStart: function(direction) {
        player.setDirection(direction);
        player.clip.play();
      },
      onEnd: function() {
        player.clip.gotoAndStop(0);
      },
    });


    // TODO need dynamic view size
    var viewW = 640;
    var viewH = 640;
    //var viewW = 320;
    //var viewH = 320;
    WorldView(world, container, player, viewW, viewH, scale);

    // Portal handling
    // TODO player jumps through portal with the slightest overlap.
    //      would be nicer to wait until the player is overlapping more
    //      so it feels like you're *in* the portal
    world.contactListener(player, function(fixture) {
      if (fixture.objectData.portal) {
        sceneManager.load(fixture.objectData.portal);
      }
    });


    // Coin handling
    world.contactListener(player, function(fixture) {
      if (fixture.objectData.coin) {
          container.removeChild(fixture.objectData.clip);
          player.coins += 1;

          world.scheduleUpdate(function() {
            world.remove(fixture);
          });
      }
    });


    function makeScene(playerX, playerY, playerDirection, viewX, viewY) {
        return function() {
            container.visible = true;

            container.x = viewX;
            container.y = viewY;

            player.setDirection(playerDirection);
            player.clip.position.x = playerX;
            player.clip.position.y = playerY;

            var x = (playerX / scale) + (playerW / scale / 2);
            var y = (playerY / scale) + (playerH / scale / 2);

            // TODO before I had world.start() *before* this line,
            //      which is the wrong order, and only didn't fail because
            //      of the 15 ms interval time. Things like this need to happen
            //      outside of a world step, which is an important reason to 
            //      build good encapsulation for box2d.
            body.SetTransform(new Box2D.b2Vec2(x, y), body.GetAngle());

            world.start();
            // TODO container.width = 32 * 8;

            sceneManager.onFrame = function() {
              var pos = body.GetPosition();

              // TODO is it inefficient to do this on every frame? I don't know.
              //      is it really worth an event/callback?
              playerCoinCountText.setText('Player coins: ' + player.coins);

              player.clip.position.x = (pos.get_x() * scale) - (playerW / 2);
              player.clip.position.y = (pos.get_y() * scale) - (playerH / 2)
            }

            var deregisterKeybindings = keybindings.listen(function(event) {
              movement(event);

              if (event == 'Use keydown') {
                switch (player.getDirection()) {
                  case 'up':
                    var x1 = player.clip.position.x;
                    var y1 = player.clip.position.y - 10;
                    var x2 = player.clip.position.x + 32;
                    var y2 = player.clip.position.y;
                    break;

                  case 'down':
                    var x1 = player.clip.position.x;
                    var y1 = player.clip.position.y + 32;
                    var x2 = player.clip.position.x + 32;
                    var y2 = player.clip.position.y + 32 + 10;
                    break;

                  case 'left':
                    var x1 = player.clip.position.x - 10;
                    var y1 = player.clip.position.y;
                    var x2 = player.clip.position.x;
                    var y2 = player.clip.position.y + 32;
                    break;

                  case 'right':
                    var x1 = player.clip.position.x + 32;
                    var y1 = player.clip.position.y;
                    var x2 = player.clip.position.x + 32 + 10;
                    var y2 = player.clip.position.y + 32;
                    break;
                }
                var res = world.query(x1, y1, x2, y2);

                // TODO this could affect multiple objects. only want to affect one.
                for (var i = 0; i < res.length; i++) {
                  var obj = res[i][2];
                  // Chest handling
                  if (obj.chest) {
                    obj.open(player);
                  }
                }
              }
            });

            // return unload function
            return function() {
              world.stop();
              // TODO sceneManager should handle removing the containers from
              //      the master container?
              container.visible = false;
              deregisterKeybindings();
            }
        }
    }

    // TODO do i really want these split? probably not
    for (var layer_i = 0; layer_i < map.tilelayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.tilelayers[layer_i].length; obj_i++) {
        var obj = map.tilelayers[layer_i][obj_i];
        container.addChild(obj);
      }
    }

    for (var layer_i = 0; layer_i < map.objectlayers.length; layer_i++) {
      for (var obj_i = 0; obj_i < map.objectlayers[layer_i].length; obj_i++) {
        var obj = map.objectlayers[layer_i][obj_i];

        if (obj.isBlock) {
          world.addStatic(obj, obj.x, obj.y, obj.w, obj.h);
        }

        else if (obj.portal) {

          var g = new PIXI.Graphics();
          g.beginFill(0x00ffaa);
          g.drawRect(obj.x, obj.y, obj.w, obj.h);
          g.endFill();
          container.addChild(g);

          world.addSensor(obj, obj.x, obj.y, obj.w, obj.h);
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
          var squirrel = Squirrel.create();
          squirrel.clip.position.x = obj.x;
          squirrel.clip.position.y = obj.y;
          world.addStatic(squirrel, obj.x, obj.y, obj.w, obj.h);
          container.addChild(squirrel.clip);
        }

        else if (obj.type == 'coin') {
          var coin = Coins.create();
          coin.clip.position.x = obj.x;
          coin.clip.position.y = obj.y;
          world.addStatic(coin, obj.x, obj.y, obj.w, obj.h);
          container.addChild(coin.clip);
        }

        else if (obj.type == 'chest') {
          var chest = Chests.create();
          chest.clip.position.x = obj.x;
          chest.clip.position.y = obj.y;
          world.addStatic(chest, obj.x, obj.y, obj.w, obj.h);
          container.addChild(chest.clip);
        }
      }
    }

    container.addChild(player.clip);
    container.addChild(playerCoinCountText);
  });
}
