define(function() {

  function TrackPlayer(s, player, layerNames) {

      s.on('tick', function() {

          for (var i = 0; i < layerNames.length; i++) {
              var layer = s.renderer.getLayer(layerNames[i]);
              layer.x = Math.floor(layer.stage.width / 2) - player.x;
              layer.y = Math.floor(layer.stage.height / 2) - player.y;
          }
      });
  }

  return TrackPlayer;
});
