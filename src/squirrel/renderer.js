define(function() {

  function loadSquirrelTextures() {

      var imgSrc = "media/squirrel-glued/squirrel-pieces.png";
      var jsonSrc = "media/squirrel-glued/squirrel-pieces.json";

      return loadSpriteSheet(imgSrc, jsonSrc).then(function(parts) {

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
          'move-up': getSequence('move-up', 3),
          'move-down': getSequence('move-down', 3),
          'move-left': getSequence('move-left', 3),
          'move-right': getSequence('move-right', 3),
        };
      });
  }

  // TODO need to figure out async loading in services
  var texturesLoader = loadSquirrelTextures();

  return {
    create: function(squirrel) {
      var clip;

      texturesLoader.then(function(textures) {
          clip = new PIXI.MovieClip(textures['idle-left']);
          clip.width = squirrel.w;
          clip.height = squirrel.h;
          clip.animationSpeed = 0.07;
          clip.play();
          container.addChild(clip);

          // TODO need deregistration function
          container.addFrameListener(function() {
            var state = squirrel.getMovementState();

            if (state) {
              // TODO s/direction/name/
              var percentComplete = state.getPercentComplete();
              var pos = state.moveDef.getPositionAt(percentComplete);
              clip.position.x = pos.x;
              clip.position.y = pos.y;

              var textureName = 'move-' + state.moveDef.direction;
              clip.textures = textures[textureName];

            } else {
              var pos = squirrel.getPosition();
              clip.position.x = pos.x;
              clip.position.y = pos.y;

              var textureName = 'idle-' + squirrel.getDirection();
              clip.textures = textures[textureName];
            }

          });
      });

      return function() {
        if (clip) {
          container.removeChild(clip);
        }
      };
    }
  };
});
