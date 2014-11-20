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
    input,
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

    var plugins = [
      input.Input,
      // TODO Input type should be detected
      input.KeyboardInput,

      function(scene) {
        scene.config.container = container;
      },

      Renderer,

      function(scene) {
        scene.renderer.addLayers('background', 'objects', 'player', 'hud');
      },

      WorldMap,
      World,

      Pathfinding,

      Background,

      Player,

      TrackPlayer('background', 'objects', 'player'),

      Wall,
      Door,
      DoorSwitch,
      Squirrel,

      FPSMeter,
      HUD,
    ];

    var loadpoints = loadpointsLoader.load('maps/Level 1.json', plugins);

    loadpoints['dead'] = {
      config: {},
      plugins: [

        input.Input,
        // TODO Input type should be detected
        input.KeyboardInput,

        function(scene) {
          scene.config.container = container;
        },

        Renderer,
        Dead
      ],
    };

    var app = Biscuits(loadpoints);

    app.start('Loadpoint 1a');
});
