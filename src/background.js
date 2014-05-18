'use strict';

function loadBackgroundTilesFromJSON() {
  // TODO
  // TODO this will likely return a promise
  return BackgroundTiles;
}

function BackgroundTiles(tilesDef) {

  // TODO this manages the cached tiles
  //      at some point it should unload old tiles
  function query(x, y, w, h, callback) {
    var scaledX = Math.floor(x / tilesDef.tileWidth);
    var scaledY = Math.floor(y / tilesDef.tileHeight);
    var scaledMaxX = scaledX + Math.floor(w / tilesDef.tileWidth) + 1;
    var scaledMaxY = scaledY + Math.floor(h / tilesDef.tileHeight) + 1;

    for (var y = scaledY; y < scaledMaxY; y++) {
      for (var x = scaledX; x < scaledMaxX; x++) {
        var tile = tilesDef.getTile(x, y);
        if (tile) {
          callback(tile);
        }
      }
    }
  }

  return {
    query: query,

    // Used to prefetch tile resources
    prefetch: function(x, y, w, h) {
      query(x, y, w, h, function(tile) {
        tile.load();
      });
    },
  };
}

function BackgroundRegion(_width, _height, tiles) {
  var x = 0;
  var y = 0;
  var width = _width;
  var height = _height;
  // TODO should this fetch the initial area, or wait for setPosition?

  return {
    setPosition: function(_x, _y) {
      x = _x;
      y = _y;
      tiles.prefetch(x, y, width, height);
    },
    resize: function(w, h) {
      width = w;
      height = h;
      tiles.prefetch(x, y, width, height);
    },
    forEachTile: function(callback) {
      tiles.query(x, y, width, height, callback);
    },
  };
}

function BackgroundRenderer(backgroundRegion, container) {
  var renderable = new TileBatchRenderable(backgroundRegion.forEachTile);
  container.addChild(renderable);
}
