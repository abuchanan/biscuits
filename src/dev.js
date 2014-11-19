define([
    'biscuits',
    'input',
    'Renderer',
    'scenes/world/WorldMap',
    'scenes/world/World',
    'scenes/world/Background',
    'scenes/world/player/PlayerBody',
    'scenes/world/player/actions',
    'scenes/world/player/PlayerRenderer',
    'scenes/world/TrackPlayer',
    'scenes/world/objects/Wall',
    'scenes/world/objects/Door',

    'loadpoints',
    'FPSMeter',

], function(
    Biscuits,
    input,
    Renderer,
    WorldMap,
    World,
    Background,
    PlayerBody,
    PlayerActions,
    PlayerRenderer,
    TrackPlayer,
    Wall,
    Door,

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
        scene.renderer.addLayers('background', 'objects', 'hud');
      },

      WorldMap,
      World,

      Background,

      PlayerBody,
      PlayerActions,
      PlayerRenderer,

      TrackPlayer('background', 'objects'),

      Wall,
      Door,

      FPSMeter,
    ];

    var loadpoints = loadpointsLoader.load('maps/Level 1.json', plugins);
    var app = Biscuits(loadpoints);

    app.start('Loadpoint 2a');
});
