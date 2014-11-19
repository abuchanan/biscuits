define(['sprites'], function(sprites) {

  var imgSrc = "media/player-pieces.png";
  var jsonSrc = "media/player-pieces.json";

  // TODO re-implement async handling
  var parts = sprites.loadSpriteSheetSync(imgSrc, jsonSrc);

  // TODO define this stuff in JSON. build a tool to help build these texture packs.
  return {
    'stop-up': [
      parts['up-0'],
    ],
    'stop-down': [
      parts['down-0'],
    ],
    'stop-left': [
      parts['left-0'],
    ],
    'stop-right': [
      parts['right-0'],
    ],
    'walk-up': [
      parts['up-0'],
      parts['up-1'],
      parts['up-2'],
      parts['up-3'],
      parts['up-4'],
    ],
    'walk-down': [
      parts['down-0'],
      parts['down-1'],
      parts['down-2'],
      parts['down-3'],
      parts['down-4'],
    ],
    'walk-right': [
      parts['right-0'],
      parts['right-1'],
      parts['right-2'],
      parts['right-1'],
      parts['right-3'],
    ],
    'walk-left': [
      parts['left-0'],
      parts['left-1'],
      parts['left-2'],
      parts['left-1'],
      parts['left-3'],
    ],
    'sword-up': [
      parts['sword-up-0'],
    ],
    'sword-down': [
      parts['sword-down-0'],
    ],
    'sword-left': [
      parts['sword-left-0'],
    ],
    'sword-right': [
      parts['sword-right-0'],
    ],
  };

});
