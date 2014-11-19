define(['./TiledJSON'], function(TiledJSON) {

    // Module exports
    return {
        load: load,
    };


    function load(mapID, initialPlayerPosition) {

      var map = TiledJSON.loadMapSync(mapID);
      // TODO all this converting back and forth from pixels to coordinates
      //      is annoying!
      var tileWidth = map.mapData.tilewidth;
      var tileHeight = map.mapData.tileheight;
      var pos = {
        x: initialPlayerPosition.x * tileWidth,
        y: initialPlayerPosition.y * tileHeight,
        w: tileWidth,
        h: tileHeight,
      };

      var regionMap = {
        tilelayers: [],
        objectlayers: [],
        mapData: map.mapData,
      };

      map.forEachObject(function(obj) {
        if (obj.hasType('region') && inRegion(obj, pos)) {

          var region = obj;

          map.tilelayers.forEach(function(layer) {
            var tileLayer = [];

            layer.forEach(function(tile) {
              if (inRegion(region, tile)) {
                tileLayer.push(tile);
              }
            });

            if (tileLayer.length > 0) {
              regionMap.tilelayers.push(tileLayer);
            }
          });

          map.objectlayers.forEach(function(layer) {
            var objectLayer = [];

            layer.forEach(function(obj) {

              if (!obj.hasType('region') && inRegion(region, obj)) {
                objectLayer.push(obj);
              }
            });

            if (objectLayer.length > 0) {
              regionMap.objectlayers.push(objectLayer);
            }
          });
        }
      });

      return regionMap;
    }


    function inRegion(region, item) {
      var iw = item.w || item.width;
      var ih = item.h || item.height;
      var ix1 = item.x;
      var iy1 = item.y;
      var ix2 = ix1 + iw;
      var iy2 = iy1 + ih;

      var rw = region.w;
      var rh = region.h;
      var rx1 = region.x;
      var ry1 = region.y;
      var rx2 = rx1 + rw;
      var ry2 = ry1 + rh;

      return ix2 >= rx1 && ix1 <= rx2 && iy2 >= ry1 && iy1 <= ry2;
    }
});
