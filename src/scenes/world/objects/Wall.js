define(['../Body'], function(Body) {

    function Wall(s) {
        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        for (var i = 0, ii = s.map.objectlayers.length; i < ii; i++) {
            var layer = s.map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Wall')) {
                  var x = obj.x / tileWidth;
                  var y = obj.y / tileHeight;
                  var w = obj.w / tileWidth;
                  var h = obj.h / tileHeight;

                  s.create(Body, x, y, w, h, true);
                }
            }
        }
    }

    return Wall;
});
