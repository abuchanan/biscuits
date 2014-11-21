define(['./textures', 'lib/pixi'], function(textures, PIXI) {

  function PlayerRenderer(s) {

    var clip = new PIXI.MovieClip(textures['stop-south']);
    s.renderable = clip;

    var tileWidth = s.map.mapData.tilewidth;
    var tileHeight = s.map.mapData.tileheight;

    // TODO scale player sprite images in actual image file
    clip.width = tileWidth;
    clip.height = tileHeight;
    // TODO base animationSpeed on movement speed definitions
    clip.animationSpeed = 0.1;

    var layer = s.renderer.getLayer('player');
    layer.addChild(clip);


    s.on('tick', function() {
        var action = s.actions.manager.getCurrentAction();

        // TODO need a way to split up the rendering of various movements
        //      into discrete pieces. i.e. make action/movement rendering
        //      pluggable
        if (action && action.isMovement) {

            var textureName = action.name;
            clip.textures = textures[textureName];
            clip.play();

            var pos = action.interpolatePosition();

            // TODO have some other layer that automatically scales positions
            clip.x = Math.floor(pos.x * tileWidth);
            clip.y = Math.floor(pos.y * tileHeight);


        // TODO try to remove this stop special case. Maybe actions should be
        //      DFAs. After each walk action, it would move to a "stop-{direction"
        //      state.
        //      This would allow a nice action/DFA modeling tool too.
        //
        //      Something to ask: how would concurrent actions/states be handled?
        } else {
            var pos = s.body.getPosition();

            // TODO have some other layer that automatically scales positions
            clip.x = pos.x * tileWidth;
            clip.y = pos.y * tileHeight;

            var textureName = 'stop-' + s.body.direction;
            clip.textures = textures[textureName];
            clip.gotoAndStop(0);
        } 
    });

    return clip;
  }


  return PlayerRenderer;
});
