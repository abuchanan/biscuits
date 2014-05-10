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

    var texture = PIXI.Texture.fromImage(tileset.image);

    var slices = {};
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

    return slices;
}

function parseObjectLayer(layer, map, worldScale) {
  var all = [];

  for (var i = 0; i < layer.objects.length; i++) {
      var obj = layer.objects[i];


      var pos = {
        // TODO inconsistent with background tiles
        x: obj.x / worldScale,
        y: obj.y / worldScale,
        w: obj.width / worldScale,
        h: obj.height / worldScale,
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

          var sprite = new PIXI.Sprite(slice);
          sprite.position.x = x * map.tilewidth;
          sprite.position.y = y * map.tileheight;
          tiles.push(sprite);
        }
    }
  }

  return tiles;
}

function parseMap(map, worldScale) {

  // TODO parse all tilesets
  var tileset = parseTileset(map.tilesets[0]);
  var data = {
    tilelayers: [],
    objectlayers: [],
  };

  for (var layer_i = 0; layer_i < map.layers.length; layer_i++) {
      var layer = map.layers[layer_i];

      if (layer.type == 'tilelayer') {
        var tilelayer = parseTileLayer(map, layer, tileset);
        data.tilelayers.push(tilelayer);

      } else if (layer.type = 'objectgroup') {
        var objectlayer = parseObjectLayer(layer, map, worldScale);
        data.objectlayers.push(objectlayer);
      }
  }

  return data;
}

function loadMap(src, worldScale) {
  var deferred = Q.defer();
  var req = new XMLHttpRequest();
  req.onload = function() {
    var d = JSON.parse(this.responseText);
    var data = parseMap(d, worldScale);
    deferred.resolve(data);
  };
  // TODO if this request fails, the whole app will hang
  req.responseType = 'application/json';
  req.overrideMimeType('application/json');
  req.open('get', src, true);
  req.send();
  return deferred.promise;
}
