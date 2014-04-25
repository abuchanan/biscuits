
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
