define([
    'biscuits',
    'input',
    'Renderer',
    'scenes/world/WorldMap',
    'scenes/world/World',

    'scenes/world/pathfinding/Pathfinding',

    'scenes/world/Background',

    'scenes/world/player/Player',

    'scenes/world/TrackPlayer',
    'scenes/world/objects/Wall',
    'scenes/world/objects/Door',
    'scenes/world/objects/DoorSwitch',
    'scenes/world/objects/squirrel/Squirrel',

    'loadpoints',
    'FPSMeter',
    'Dead',
    'HUD',

], function(
    Biscuits,
    KeyboardInput,
    Renderer,
    WorldMap,
    World,

    Pathfinding,

    Background,

    Player, 

    TrackPlayer,
    Wall,
    Door,
    DoorSwitch,
    Squirrel,

    loadpointsLoader,
    FPSMeter,
    Dead,
    HUD
) {

    var container = document.getElementById("biscuits-container");


    var loadpoints = loadpointsLoader.load('maps/Level 1.json', function(s) {

      // TODO Input type should be detected
      s.mixin(KeyboardInput);

      s.objects = {};

      // TODO this feels a little out of place. why doesn't it use s.create()?
      s.mixin(WorldMap);

      // TODO this is getting the whole map, not just the current region
      s.world = s.create(World, 0, 0, s.map.mapData.width, s.map.mapData.height);
      s.world.mixin(Pathfinding);

      s.renderer = s.create(Renderer, container);
      s.renderer.addLayers('background', 'objects', 'player', 'hud');

      // TODO sometimes I'm not sure whether to pass something in, 
      //      or get it from the scope
      s.mixin(Background, s.map);

      s.player = s.create(Player);
      s.create(TrackPlayer, s.player.playerRenderer.renderable,
               ['background', 'objects', 'player']);

      s.create(Wall);
      s.create(Door);
      s.create(DoorSwitch);
      s.create(Squirrel);

      s.create(HUD);
      s.create(FPSMeter);

    });

    loadpoints['dead'] = function(s) {

      // TODO Input type should be detected
      s.mixin(KeyboardInput);
      s.renderer = s.create(Renderer, container);

      s.mixin(Dead);
    };

    var app = Biscuits(loadpoints);

    app.start('Loadpoint 1a');
});
