define(['sprites'], function(sprites) {

    var imgSrc = "media/squirrel-pieces.png";
    var jsonSrc = "media/squirrel-pieces.json";

    var parts = sprites.loadSpriteSheetSync(imgSrc, jsonSrc);

    function getSequence(prefix, length) {
      var seq = [];
      for (var i = 0; i < length; i++) {
        var name = prefix + '-' + i;
        seq.push(parts[name]);
      }
      return seq;
    }

    return {
      'idle-up': getSequence('idle-up', 8),
      'idle-down': getSequence('idle-down', 8),
      'idle-left': getSequence('idle-left', 8),
      'idle-right': getSequence('idle-right', 8),
      'walk-up': getSequence('move-up', 3),
      'walk-down': getSequence('move-down', 3),
      'walk-left': getSequence('move-left', 3),
      'walk-right': getSequence('move-right', 3),
    };
});
