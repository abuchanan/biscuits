
function loadWorld(mapfile, sceneManager, container) {

  var reqs = [
    Player(),
    SquirrelService(),
    loadMap(mapfile).then(parseMap),
  ];

  return Q.spread(reqs, function(player, Squirrel, layers) {

    // TODO maybe loadpoint from Tiled should determine layer?
    //var squirrel = Squirrel.create();
    var keybindings = KeyBindingsService(document);
    var onTick = [];

    var world = World();

    //var view = new WorldView(world, 20, 20);

    /*
    var collider = PlayerCollider(world, player);
    */
    for (var layer_i = 0; layer_i < layers.length; layer_i++) {
      for (var obj_i = 0; obj_i < layers[layer_i].length; obj_i++) {
        var obj = layers[layer_i][obj_i];
        container.addChild(obj);
      }
    }

    var playerSprite = player.sprites.down;
    container.addChild(playerSprite);

    var body = world.add(player, 20, 20);

    var movement = MovementHandler(body, {
      onStart: function(direction) {
        player.direction = direction;
      },
    });

    playerSprite.scale.x = 0.5;
    playerSprite.scale.y = 0.5;

    function onFrame(ctx) {
      //view.render(ctx);
      var pos = body.GetPosition()
      //console.log(pos.get_x(), pos.get_y());

      playerSprite.position.x = pos.get_x() * 10;
      playerSprite.position.y = pos.get_y() * 10;

      for (var i = 0, ii = onTick.length; i < ii; i++) {
        onTick[i]();
      }
    }

    function makeScene(playerX, playerY, viewX, viewY) {
        return function() {
            world.start();

            // TODO set player position
            // TODO not only set position, but direction
            //view.position.set(viewX, viewY);
            sceneManager.render = onFrame;

            var deregisterKeybindings = keybindings.listen(function(name) {
              movement[name]();
            });

            // return unload function
            return function() {
              world.stop();
              deregisterKeybindings();
            }
        }
    }

    sceneManager.addScene('box2dtest', makeScene(0, 0, 0, 0));


  });
}

            /*
          if (obj.type == 'loadpoint') {
              console.log(obj.type, obj.name);
              // TODO better default than 0, like center player in view
              var viewX = obj.viewX || 0;
              var viewY = obj.viewY || 0;
              var load = makeScene(obj.x, obj.y, viewX, viewY);
              sceneManager.addScene(obj.name, load);

          } else {
              //var pos = new Position(obj.x, obj.y)

              if (obj.portal) {
                obj.handlePlayerCollision = sceneManager.load.bind(sceneManager, obj.portal);
              }


              if (obj.type == 'squirrel') {

                  obj.render = squirrel.render.bind(squirrel);
                  obj.isBlock = true;
                  onTick.push(SquirrelMovement(world, pos));
              }

              world.add(obj, layer_i, pos, obj.w, obj.h);
          }
              */
