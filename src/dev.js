
      s.objects = {};

      s.world.mixin(Pathfinding);




    loadpoints['dead'] = function(s) {

      // TODO Input type should be detected
      s.input = s.create(Input);
      s.input.mixin(KeyboardInput);

      s.renderer = s.create(Renderer, container);

      s.mixin(Dead);
    };

    var app = Biscuits(loadpoints);
