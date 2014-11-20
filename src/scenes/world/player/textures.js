define(['sprites'], function(sprites) {

  var imgSrc = "media/player-pieces.png";
  var jsonSrc = "media/player-pieces.json";

  // TODO re-implement async handling
  var parts = sprites.loadSpriteSheetSync(imgSrc, jsonSrc);

  // TODO define this stuff in JSON. build a tool to help build these texture packs.
  return {
    'stop-north': [
      parts['north-0'],
    ],
    'stop-south': [
      parts['south-0'],
    ],
    'stop-west': [
      parts['west-0'],
    ],
    'stop-east': [
      parts['east-0'],
    ],
    'walk-north': [
      parts['north-0'],
      parts['north-1'],
      parts['north-2'],
      parts['north-3'],
      parts['north-4'],
    ],
    'walk-south': [
      parts['south-0'],
      parts['south-1'],
      parts['south-2'],
      parts['south-3'],
      parts['south-4'],
    ],
    'walk-east': [
      parts['east-0'],
      parts['east-1'],
      parts['east-2'],
      parts['east-1'],
      parts['east-3'],
    ],
    'walk-west': [
      parts['west-0'],
      parts['west-1'],
      parts['west-2'],
      parts['west-1'],
      parts['west-3'],
    ],
    'sword-north': [
      parts['sword-north-0'],
    ],
    'sword-south': [
      parts['sword-south-0'],
    ],
    'sword-west': [
      parts['sword-west-0'],
    ],
    'sword-east': [
      parts['sword-east-0'],
    ],
  };

});
