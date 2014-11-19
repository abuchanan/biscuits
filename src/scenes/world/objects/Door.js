define(['../Body'], function(Body) {

    function handleCollision(body, obj, scene) {
        body.events.on('player collision', function(playerBody) {
          scene.start(obj.Destination);
        });
    }

    function Door(scene) {
        var map = scene.map;
        var tileWidth = scene.map.mapData.tilewidth;
        var tileHeight = scene.map.mapData.tileheight;

        for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
            var layer = map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Door')) {
                  var x = obj.x / tileWidth;
                  var y = obj.y / tileHeight;
                  var w = obj.w / tileWidth;
                  var h = obj.h / tileHeight;

                  var body = Body(x, y, w, h, scene.world);
                  handleCollision(body, obj, scene);
                }
            }
        }
    }

    return Door;
});
