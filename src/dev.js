
      s.objects = {};

      s.world.mixin(Pathfinding);




    loadpoints['dead'] = function(s) {

      s.mixin(Dead);
    };

    var app = Biscuits(loadpoints);
