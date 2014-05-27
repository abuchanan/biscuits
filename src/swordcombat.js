
function SwordCombat(player, world, damage) {
  damage = damage || 1;

  return function() {
      // TODO swinging a sword or any other action needs to be spaced out
      //      just like walking

      // TODO this probably isn't the best query. the player should
      //      be able to hit an object it's standing *on top* of
      // TODO weapons will differ in their query area
      var frontRect = player.immediateFrontRect();
      var playerAreaRect = player.getRect();

      var areas = [frontRect, playerAreaRect];

      world.broadcast('hit', areas);

      // TODO manage whether multiple objects can be hit
      /*
      for (var i = 0; i < res.length; i++) {
        var obj = res[i];
        if (obj.data && obj.data.hittable) {
          obj.data.hit(damage);
        }
      }
      */
  }
}
