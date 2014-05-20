'use strict';

define(function() {

  return function(sceneName, tileWidth, tileHeight) {

    // TODO configurable
    var baseUrl = '/media/background-tiles/' + sceneName + '/';
    function getTilePath(x, y) {
      return baseUrl + x + '-' + y + '.png';
    }

    function makeTile(x, y) {
      var url = getTilePath(x, y);
      var renderable;

      function load() {
        // TODO once again, is this synchronous?
        var s = PIXI.Sprite.fromImage(url);
        // TODO can use sprite width/height?
        s.x = tileWidth * x;
        s.y = tileHeight * y;
        renderable = s;
      }

      return {
        // TODO not sure it's good design to have this know about PIXI
        //      seems like it'd be better to centralize the code that
        //      knows how to render things rather than spread it out
        //      around all the objects in the world (player, NPC, chest,
        //      background, etc), but for now at least this is the fast
        //      route to working with the current architecture.
        getRenderable: function() {
          if (!renderable) {
            load();
          }
          return renderable;
        },
        load: load,
        unload: function() {
          renderable = false;
        },
      };
    }

    return {
      tileWidth: tileWidth,
      tileHeight: tileHeight,
      getTile: function(x, y) {
        // TODO check bounds. check that tile exists.
        return makeTile(x, y);
      },
    };
  };
});
