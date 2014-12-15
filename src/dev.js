
    var loadpoints = loadpointsLoader.load('maps/Level 1.json', function(s) {

      s.objects = {};

      // TODO this feels a little out of place. why doesn't it use s.create()?
      s.mixin(WorldMap);

      // TODO this is getting the whole map, not just the current region
      s.world = s.create(World, 0, 0, s.map.mapData.width, s.map.mapData.height);
      s.world.mixin(Pathfinding);
    });

    loadpoints['dead'] = function(s) {

      // TODO Input type should be detected
      s.input = s.create(Input);
      s.input.mixin(KeyboardInput);

      s.renderer = s.create(Renderer, container);

      s.mixin(Dead);
    };

    var app = Biscuits(loadpoints);

    app.loadScene('Loadpoint 1a');
});
