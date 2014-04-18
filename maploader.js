function parseTileset(tileset) {

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

function parseMap(data) {

  return parseTileset(data.tilesets[0])
  /*
  for (var i = 0; i < data.tilesets.length; i++) {
    var tileset = data.tilesets[i];

  }

  for (var i = 0; i < data.layers.length; i++) {
  }
  */

}
