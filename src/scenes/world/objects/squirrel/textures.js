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
      'idle-north': getSequence('idle-north', 8),
      'idle-south': getSequence('idle-south', 8),
      'idle-west': getSequence('idle-west', 8),
      'idle-east': getSequence('idle-east', 8),
      'walk-north': getSequence('move-north', 3),
      'walk-south': getSequence('move-south', 3),
      'walk-west': getSequence('move-west', 3),
      'walk-east': getSequence('move-east', 3),
    };
});
