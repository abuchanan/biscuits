define(['lib/pixi', './textures'], function(PIXI, textures) {


    function SquirrelRenderer(s, actionManager) {

        var clip = new PIXI.MovieClip(textures['idle-west']);

        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        clip.width = tileWidth;
        clip.height = tileHeight;

        // TODO configurable
        // TODO make match action duration
        clip.animationSpeed = 0.07;
        clip.play();

        var layer = s.renderer.getLayer('objects');
        layer.addChild(clip);

        s.on('tick', function() {
            var action = actionManager.getCurrentAction();

            // TODO exactly same code as player renderer. DRY
            if (action && action.isMovement) {

              var textureName = action.name;
              clip.textures = textures[textureName];
              clip.play();

              var pos = action.interpolatePosition();

              // TODO have some other layer that automatically scales positions
              clip.x = Math.floor(pos.x * tileWidth);
              clip.y = Math.floor(pos.y * tileHeight);


            } else {
              var pos = s.body.getPosition();

              // TODO have some other layer that automatically scales positions
              clip.x = pos.x * tileWidth;
              clip.y = pos.y * tileHeight;

              var textureName = 'idle-' + s.body.direction;
              clip.textures = textures[textureName];
              clip.play();
            }
        });

        // TODO it would be nice if "s.renderer" was nicely wrapped
        //      so it could destroy itself. that way each object wouldn't
        //      have to worry about it
        s.on('destroy', function() {
            console.log('remove');
             layer.removeChild(clip);
        });
    }


    return SquirrelRenderer;
});
