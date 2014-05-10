
function Useable(player, world) {
  return function(eventname) {
      // TODO or keyup?
      if (eventname == 'Use keydown') {
        var res = player.queryImmediateFront();

        // TODO this could affect multiple objects. only want to affect one.
        for (var i = 0; i < res.length; i++) {
          var obj = res[i];
          if (obj.useable) {
            obj.use();
          }
        }
      }
  }
}
