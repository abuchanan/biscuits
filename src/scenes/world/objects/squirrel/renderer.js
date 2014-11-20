define(['lib/pixi', './textures'], function(PIXI, textures) {


    function SquirrelRenderer(scene, body, actionManager) {

        var clip = new PIXI.MovieClip(textures['idle-left']);

        var tileWidth = scene.map.mapData.tilewidth;
        var tileHeight = scene.map.mapData.tileheight;

        clip.width = tileWidth;
        clip.height = tileHeight;

        // TODO configurable
        // TODO make match action duration
        clip.animationSpeed = 0.07;
        clip.play();

        var layer = scene.renderer.getLayer('objects');
        layer.addChild(clip);

        // TODO need deregistration function
        scene.events.on('tick', function() {
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
              var pos = body.getPosition();

              // TODO have some other layer that automatically scales positions
              clip.x = pos.x * tileWidth;
              clip.y = pos.y * tileHeight;

              var textureName = 'idle-' + body.direction;
              clip.textures = textures[textureName];
              clip.play();
            }

        });
    }


    return SquirrelRenderer;
});
