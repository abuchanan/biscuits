function Tile(x, y, w, h, sprite) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.sprite = sprite;
}
Tile.prototype = {
  render: function() {
    this.sprite.render.apply(this.sprite, arguments);
  }
}


function parseTileset(tileset) {

    // TODO figure out how global vs local tile IDs works
    var tileID = tileset.firstgid;
    var tileX = tileset.margin;
    var tileY = tileset.margin;

    return loadSpriteSheet(tileset.image).then(function(sheet) {

        var slices = {};
        var maxX = tileset.imagewidth - tileset.margin - tileset.tilewidth;

        while (tileY < tileset.imageheight) {

            var slice = sheet.slice(tileX, tileY,
                                    tileset.tilewidth, tileset.tileheight);

            slices[tileID] = slice;

            if (tileX == maxX) {
              tileX = tileset.margin;
              tileY += tileset.tileheight + tileset.spacing;
            } else {
              tileX += tileset.tilewidth + tileset.spacing;
            }

            tileID += 1;
        }

        return slices;
    });
}

function parseObjectLayer(layer, map) {
  var all = [];

  for (var i = 0; i < layer.objects.length; i++) {
      var obj = layer.objects[i];

      var x = obj.x / map.tilewidth;
      var y = obj.y / map.tileheight;
      var w = obj.width / map.tilewidth;
      var h = obj.height / map.tileheight;

      var pos = {
        x: x,
        y: y,
        w: w,
        h: h,
        type: obj.type,
        name: obj.name,
      };

      var parsedObj = _.extend({}, layer.properties, obj.properties, pos);
      all.push(parsedObj);
  }

  return all;
}

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
          var tile = new Tile(x, y, x, y, slice);
          tiles.push(tile);
        }
    }
  }

  return tiles;
}

function parseMap(map) {

  return Q.all([
      parseTileset(map.tilesets[0]),
    ]).then(function(tilesets) {
        var tiles = tilesets[0];
        var layerObjs = [];

        for (var layer_i = 0; layer_i < map.layers.length; layer_i++) {
            var layer = map.layers[layer_i];

            if (layer.type == 'tilelayer') {
              var x = parseTileLayer(map, layer, tiles);
              layerObjs.push(x);

            } else if (layer.type = 'objectgroup') {
              var x = parseObjectLayer(layer, map);
              layerObjs.push(x);
            }
        }

      return layerObjs;
    });
}

function loadMap(src) {
  var deferred = Q.defer();
  var req = new XMLHttpRequest();
  req.onload = function() {
    var d = JSON.parse(this.responseText);
    deferred.resolve(d);
  };
  // TODO if this request fails, the whole app will hang
  req.responseType = 'application/json';
  req.overrideMimeType('application/json');
  req.open('get', src, true);
  req.send();
  return deferred.promise;
}
