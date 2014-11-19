// TODO maybe this is a pre-processing step in the future?
//      shouldn't have to load and parse every map upfront
define(['scenes/world/map/loaders/TiledJSON'], function(loader) {

  function load(mapID, plugins) {
    var map = loader.loadMapSync(mapID);
    var tileWidth = map.mapData.tilewidth;
    var tileHeight = map.mapData.tileheight;

    var loadpoints = {};

    for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
      var layer = map.objectlayers[i];
      for (var j = 0, jj = layer.length; j < jj; j++) {
        var obj = layer[j];

        if (obj.hasType('Loadpoint')) {
          var x = obj.x / tileWidth;
          var y = obj.y / tileHeight;

          loadpoints[obj.name] = {
            config: {
              mapID: mapID,
              initialPlayerPosition: {x: x, y: y, direction: obj.direction},
            },
            plugins: plugins,
          };
        }
      }
    }

    return loadpoints;
  }

  return {
    load: load,
  };
  
});
