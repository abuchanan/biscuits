
function loadWorld(mapfile, sceneManager) {

  var reqs = [
    Player(),
    SquirrelService(),
    loadMap(mapfile).then(parseMap),
  ];

  return Q.spread(reqs, function(player, Squirrel, layers) {

    var onTick = [];
    // Extra layer for player
    // TODO you don't always want the player on the top layer, e.g.
    //      walking *behind* the top of the trophy in bar1 map
    var numLayers = layers.length + 1;
    var world = new World(numLayers);
    var view = new WorldView(world, 20, 20);

    // TODO possibly this could be integrated with the player object
    //      just need to ensure that position changes in one world don't affect
    //      another (inactive) world
    var playerPosition = new Position(0, 0);

    var movement = MovementHandler(playerPosition, {
      duration: 3,
      onStart: function(direction) {
        player.direction = direction;
      },
      canMove: world.isBlocked.bind(world),
    });

    onTick.push(movement.tick);

    var collider = PlayerCollider(world, player);

    // TODO maybe loadpoint from Tiled should determine layer?
    world.add(player, numLayers - 1, playerPosition);

    playerPosition.onChange(collider);
    playerPosition.onChange(view.handlePlayerPositionChange.bind(view));

    var keybindings = KeyBindingsService(document);

    var squirrel = Squirrel.create();


    function onFrame(ctx) {
      view.render(ctx);

      for (var i = 0, ii = onTick.length; i < ii; i++) {
        onTick[i]();
      }
    }

    function makeScene(playerX, playerY, viewX, viewY) {
        return function() {
            // TODO not only set position, but direction
            playerPosition.set(playerX, playerY);
            view.position.set(viewX, viewY);
            sceneManager.render = onFrame;

            var deregisterKeybindings = keybindings.listen(function(name) {
              movement[name]();
            });

            // return unload function
            return function() {
              deregisterKeybindings();
            }
        }
    }


    for (var layer_i = 0; layer_i < layers.length; layer_i++) {
      for (var obj_i = 0; obj_i < layers[layer_i].length; obj_i++) {
        var obj = layers[layer_i][obj_i];

        if (obj.type == 'loadpoint') {
            console.log(obj.type, obj.name);
            // TODO better default than 0, like center player in view
            var viewX = obj.viewX || 0;
            var viewY = obj.viewY || 0;
            var load = makeScene(obj.x, obj.y, viewX, viewY);
            sceneManager.addScene(obj.name, load);

        } else {
            var pos = new Position(obj.x, obj.y)

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

      }
    }

  });
}
