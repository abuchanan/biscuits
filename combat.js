
function Combat(player) {

  var damage = 1;

  return function(eventname) {
    if (eventname == 'Sword keydown') {

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
