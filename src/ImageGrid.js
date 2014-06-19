export {ImageGrid};

// TODO clean this up. make it a class.
function ImageGrid(tilesDef) {

    // TODO this manages the cached tiles
    //      at some point it should unload old tiles
    function query(x, y, w, h, callback) {
      var scaledX = Math.floor(x / tilesDef.tileWidth);
      var scaledY = Math.floor(y / tilesDef.tileHeight);
      var scaledMaxX = scaledX + Math.floor(w / tilesDef.tileWidth) + 1;
      var scaledMaxY = scaledY + Math.floor(h / tilesDef.tileHeight) + 1;

      for (var iy = scaledY; iy < scaledMaxY; iy++) {
        for (var ix = scaledX; ix < scaledMaxX; ix++) {
          var tile = tilesDef.getTile(ix, iy);

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
          // TODO prefetch is currently broken
          //tile.load();
        });
      },
    };
};
