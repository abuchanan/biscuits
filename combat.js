
function Combat(player) {

  // TODO configurable damage
  var damage = 1;

  return function(eventname) {
    if (eventname == 'Sword keydown') {

        // TODO this probably isn't the best query. the player should
        //      be able to hit an object it's standing *on top* of
        var res = player.queryImmediateFront();

        // TODO manage whether multiple objects can be hit
        for (var i = 0; i < res.length; i++) {
          var obj = res[i];
          if (obj.data && obj.data.hittable) {
            obj.data.hit(damage);
          }
        }
    }
  }
}
