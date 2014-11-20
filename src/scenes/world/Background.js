define(['./TileBatchRenderable'], function(TileBatchRenderable) {

    function Background(scene) {
        var map = scene.map;
        var grid = [];
        var renderable = new TileBatchRenderable(grid.forEach.bind(grid));

        for (var i = 0, ii = map.tilelayers.length; i < ii; i++) {
          var layer = map.tilelayers[i];
          for (var j = 0, jj = layer.length; j < jj; j++) {
            grid.push(layer[j]);
          }
        }

        var layer = scene.renderer.getLayer('background');
        layer.addChild(renderable);
    }

    // Module exports
    return Background;
});