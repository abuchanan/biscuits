define(function() {

  function TrackPlayer() {
      var layerNames = arguments;

      return function(scene) {
          scene.events.on('tick', function() {
              var player = scene.player.renderable;

              for (var i = 0; i < layerNames.length; i++) {
                  var layer = scene.renderer.getLayer(layerNames[i]);
                  layer.x = Math.floor(layer.stage.width / 2) - player.x;
                  layer.y = Math.floor(layer.stage.height / 2) - player.y;
              }
          });
      };
  }

  return TrackPlayer;
});
