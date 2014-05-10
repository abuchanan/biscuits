
function Useable(player, world) {
  return function(eventname) {
      // TODO or keyup?
      if (eventname == 'Use keydown') {
        var queryArea = player.immediateFrontRect();
        var res = world.query.apply(world, queryArea);

        // TODO this could affect multiple objects. only want to affect one.
        for (var i = 0; i < res.length; i++) {
          var obj = res[i];
          if (obj.data && obj.data.useable) {
            obj.data.use();
          }
        }
      }
  }
}
