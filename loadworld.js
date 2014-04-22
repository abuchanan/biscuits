
function loadWorld(mapfile, sceneManager, container) {

  var reqs = [
    Player(),
    SquirrelService(),
    loadMap(mapfile),
  ];

  return Q.spread(reqs, function(player, Squirrel, map) {

    // TODO maybe loadpoint from Tiled should determine layer?
    var keybindings = KeyBindingsService();

    /*
    The physics world and the renderer use a different scale.

    Box2D (the physics engine) recommends a scale (meters) that doesn't match
    the renderer's scale (pixels). Because of this, we have to convert between
    the two scales, which (unfortunately) shows a bit here in this code.

    TODO clean this up and try to completely encapsulate the
         scale within World.
    */
    var scale = 32;
    var world = World(scale);

    var playerW = player.clip.width;
    var playerH = player.clip.height;

    var playerFixture = world.addDynamic(player, 0, 0, playerW, playerH);
    var body = playerFixture.GetBody();

    var movement = MovementHandler(body, {
      onStart: player.setDirection,
    });

    function makeViewEdges(viewW, viewH) {

      // TODO use chain? that way I can move the whole chain
      var edges = [
        // Top
        world.addEdgeSensor({dx: 0, dy: -1 * (viewH - 33)}, 0, 0, viewW, 0),
        // Bottom
        world.addEdgeSensor({dx: 0, dy: viewH - 33}, 0, viewH, viewW, viewH),
        // Left
        world.addEdgeSensor({dx: -1 * (viewW - 33), dy: 0}, 0, 0, 0, viewH),
        // Right
        world.addEdgeSensor({dx: viewW - 33, dy: 0}, viewW, 0, viewW, viewH),
      ];

      world.contactListener(function(fixtureA, fixtureB) {

        var dx, dy;

        for (var i = 0; i < edges.length; i++) {
          var edge = edges[i];

          if (fixtureB === edge || fixtureA === edge) {
            dx = edge.objectData.dx;
            dy = edge.objectData.dy;

            container.x += dx * -1;
            container.y += dy * -1;

            break;
          }
        }

        if (dx || dy) {
          world.scheduleUpdate(function() {
            for (var i = 0; i < edges.length; i++) {
                var body = edges[i].GetBody();
                var pos = body.GetTransform().get_p();
                var x = pos.get_x() + (dx / scale);
                var y = pos.get_y() + (dy / scale);
                body.SetTransform(new Box2D.b2Vec2(x, y), body.GetAngle());
            }
          });
        }
      });
    }


    // TODO need dynamic view size
    var viewW = 320;
    var viewH = 320;
    makeViewEdges(viewW, viewH);

    // Portal handling
    // TODO player jumps through portal with the slightest overlap.
    //      would be nicer to wait until the player is overlapping more
    //      so it feels like you're *in* the portal
    // TODO could clean up this API so that the callback is only called
    //      if a given fixture/object is matched
    world.contactListener(function(fixtureA, fixtureB) {
        if (fixtureA.objectData.portal && fixtureB.objectData === player) {
          sceneManager.load(fixtureA.objectData.portal);
        }
        else if (fixtureB.objectData.portal && fixtureA.objectData === player) {
          sceneManager.load(fixtureB.objectData.portal);
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

              player.clip.position.x = (pos.get_x() * scale) - (playerW / 2);
              player.clip.position.y = (pos.get_y() * scale) - (playerH / 2)
            }

            var deregisterKeybindings = keybindings.listen(function(name) {
              movement[name]();
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
      }
    }

    container.addChild(player.clip);
  });
}
