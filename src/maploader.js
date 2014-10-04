import PIXI from 'lib/pixi';

export {loadMapSync, Map, MapConfig, MapLoader};

class Map {};
class MapConfig {};

function parseTileset(tilesets) {
    var slices = {};

    for (var i = 0; i < tilesets.length; i++) {
      var tileset = tilesets[i];
      // TODO figure out how global vs local tile IDs works
      var tileID = tileset.firstgid;
      var tileX = tileset.margin;
      var tileY = tileset.margin;

      var texture = PIXI.Texture.fromImage(tileset.image);

      var maxX = tileset.imagewidth - tileset.margin - tileset.tilewidth;

      while (tileY < tileset.imageheight) {

          var r = new PIXI.Rectangle(tileX, tileY, tileset.tilewidth, tileset.tileheight);
          var slice = new PIXI.Texture(texture, r);

          slices[tileID] = slice;

          if (tileX == maxX) {
            tileX = tileset.margin;
            tileY += tileset.tileheight + tileset.spacing;
          } else {
            tileX += tileset.tilewidth + tileset.spacing;
          }

          tileID += 1;
      }
    }

    return slices;
}

function parseObjectLayer(layer, map) {
  var all = [];

  for (var i = 0; i < layer.objects.length; i++) {
      var obj = layer.objects[i];

      // TODO catch bad coordinates
      var pos = {
        x: obj.x,
        y: obj.y,
        w: obj.width,
        h: obj.height,
        types: obj.type.split(/[, ]+/),
        name: obj.name,

        hasType: function(type) {
          return this.types.indexOf(type) !== -1;
        }
      };

      var parsedObj = extend({}, layer.properties, obj.properties, pos);
      all.push(parsedObj);
  }

  return all;
}

// Extend a given object with all the properties in passed-in object(s).
function extend(obj) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    if (source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

function parseTileLayer(map, layer, slices) {
  var tiles = [];

  for (var y = 0; y < map.height; y++) {
    for (var x = 0; x < map.width; x++) {
        var k = (y * map.width) + x;
        var tileID = layer.data[k];
        if (tileID) {
          var slice = slices[tileID];

          if (!slice) {
            throw "No slice for tile ID: " + tileID;
          }

          var sprite = new PIXI.Sprite(slice);
          sprite.position.x = x * map.tilewidth;
          sprite.position.y = y * map.tileheight;
          tiles.push(sprite);
        }
    }
  }

  return tiles;
}

function parseImageLayer(layer) {
  return PIXI.Sprite.fromImage(layer.image);
}

function parseMap(map) {

  // TODO parse all tilesets
  var tileset = parseTileset(map.tilesets);
  var data = {
    tilelayers: [],
    objectlayers: [],
    imageLayers: [],
    // TODO cleaner
    mapData: map,

    forEachObject: function(callback) {
      for (var layer_i = 0; layer_i < data.objectlayers.length; layer_i++) {
        for (var obj_i = 0; obj_i < data.objectlayers[layer_i].length; obj_i++) {
          var obj = data.objectlayers[layer_i][obj_i];
          callback(obj, layer_i);
        }
      }
    }
  };

  for (var layer_i = 0; layer_i < map.layers.length; layer_i++) {
      var layer = map.layers[layer_i];

      if (layer.type == 'tilelayer') {
        var tilelayer = parseTileLayer(map, layer, tileset);
        data.tilelayers.push(tilelayer);

      } else if (layer.type == 'objectgroup') {
        var objectlayer = parseObjectLayer(layer, map);
        data.objectlayers.push(objectlayer);

      } else if (layer.type == 'imagelayer') {
        var imagelayer = parseImageLayer(layer);
        data.imageLayers.push(imagelayer);
      }
  }

  return data;
}

function loadMapSync(src) {
  var req = new XMLHttpRequest();

  // TODO if this request fails, the whole app will hang
  req.responseType = 'application/json';
  req.overrideMimeType('application/json');
  req.open('get', src, false);
  req.send();

  // TODO handle 404

  var d = JSON.parse(req.responseText);
  var data = parseMap(d);

  return data;
}


// TODO pluggable loaders that can recognize different file types/paths
class MapLoader {
  load(path) {
    return loadMapSync(path);
  }
}
