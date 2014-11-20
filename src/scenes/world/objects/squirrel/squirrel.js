define([
    './renderer',
    './actions',
    './driver',
    '../../Body'

], function(SquirrelRenderer, SquirrelActions, SquirrelDriver, Body) {

    function SquirrelPlugin(scene) {
        var map = scene.map;
        var tileWidth = scene.map.mapData.tilewidth;
        var tileHeight = scene.map.mapData.tileheight;

        for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
            var layer = map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Squirrel')) {
                  var x = obj.x / tileWidth;
                  var y = obj.y / tileHeight;
                  var w = obj.w / tileWidth;
                  var h = obj.h / tileHeight;
                  Squirrel(scene, x, y, w, h);

                }
            }
        }
    }


    function Squirrel(scene, x, y, w, h) {

        var body = Body(x, y, w, h, scene.world);
        var actions = SquirrelActions(scene, body);
        var renderer = SquirrelRenderer(scene, body, actions.manager);
        var driver = SquirrelDriver(scene, body, actions);

        var life = 100;

        body.events.on('hit', function() {
          life -= 10;

          if (life <= 0) {
              destroy();
              console.log('dead');
          } else {
              console.log('squirrel hit!', life);
          }
        });

        function destroy() {
            body.remove();
            renderer.destroy();
            driver.destroy();
        }
    }

    return SquirrelPlugin;
});



// TODO gosh it would be nice not to have to prefix everything with "Squirrel"

    // TODO squirrels can be destroyed which is an interesting case where an object
    //      need to destroy itself.
    //
    //      I'm pretty sure this is an important case for why every object needs
    //      its own injector, otherwise, how would you destroy all the dependencies of
    //      that object?
    /* TODO
      destroy: function() {
        body.remove();
        destroyRenderer();
        pathfinder.stop();
      },
    */
