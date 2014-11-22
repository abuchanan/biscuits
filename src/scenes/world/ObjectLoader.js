define(function() {

    function ObjectLoader(s, typeMap) {

        s.loadMap = function(map) {

            var tileWidth = map.mapData.tilewidth;
            var tileHeight = map.mapData.tileheight;

            for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
                var layer = map.objectlayers[i];
                for (var j = 0, jj = layer.length; j < jj; j++) {

                    var obj = layer[j];
                    obj.x = obj.x / tileWidth;
                    obj.y = obj.y / tileHeight;
                    obj.w = obj.w / tileWidth;
                    obj.h = obj.h / tileHeight;

                    for (var k = 0; k < obj.types.length; k++) {
                        var type = obj.types[k];
                        var func = typeMap[type];
                        if (func) {
                            console.log(func.name);
                            var objScope = s.create(func, obj);
                            s.objects[obj.name] = objScope;
                        }
                    }
                }
            }
        };
    }

    return ObjectLoader;
});
