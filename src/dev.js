define([
    'biscuits',
    'input',
    'Renderer',
    'scenes/world/WorldMap',
    'scenes/world/World',

    'scenes/world/pathfinding/Pathfinding',

    'scenes/world/Background',
    'scenes/world/player/PlayerBody',
    'scenes/world/player/actions',
    'scenes/world/player/PlayerRenderer',
    'scenes/world/TrackPlayer',
    'scenes/world/objects/Wall',
    'scenes/world/objects/Door',
    'scenes/world/objects/DoorSwitch',
    'scenes/world/objects/squirrel/Squirrel',

    'loadpoints',
    'FPSMeter',

], function(
    Biscuits,
    input,
    Renderer,
    WorldMap,
    World,

    Pathfinding,

    Background,
    PlayerBody,
    PlayerActions,
    PlayerRenderer,
    TrackPlayer,
    Wall,
    Door,
    DoorSwitch,
    Squirrel,

    loadpointsLoader,
    FPSMeter
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

      PlayerBody,
      PlayerActions,
      PlayerRenderer,

      TrackPlayer('background', 'objects', 'player'),

      Wall,
      Door,
      DoorSwitch,
      Squirrel,

      FPSMeter,
    ];

    var loadpoints = loadpointsLoader.load('maps/Level 1.json', plugins);
    var app = Biscuits(loadpoints);

    app.start('Loadpoint 1a');
});
