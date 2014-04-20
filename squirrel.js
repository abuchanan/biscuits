
function SquirrelService() {
  return loadSpriteSheet('media/Monster-squirrel.png')
  .then(function(spritesheet) {

    return {
      create: function() {
        // TODO a simple list doesn't give fine grained control over each
        //      frame (such as frame duraction). imploy a addFrame method
        var squirrelSpriteAnim = new SpriteAnimation([
          spritesheet.slice(0, 0, 30, 30),
          spritesheet.slice(30, 30, 30, 30),
          spritesheet.slice(0, 0, 30, 30),
        ]);

        return squirrelSpriteAnim;
      },
    };
  });
}

function SquirrelMovement(world, position) {
  var frame = 0;

  var movement = MovementHandler(position, {
    duration: 5,
    // TODO checking for blocks should be layer specific, i.e. I can think of
    //      cases where the player shouldn't be block by a block that's on
    //      another layer
    canMove: world.isBlocked.bind(world),
  });

  return function() {
    frame += 1;
    movement.tick();

    if (frame % 50 == 0) {
      var move = Math.random() < 0.5 ? movement.left : movement.right;
      move();
    }
  }
}
