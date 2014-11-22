define(['../Body'], function(Body) {


    function Door(s, obj) {

        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, true);
                  
        var renderer = s.create(DoorRenderer);

        s.body.on('player collision', function(playerBody) {
          if (!s.isLocked()) {
            s.start(obj.Destination);
          }
        });

        var locks = {};

        s.isLocked = function() {
            return Object.keys(locks).length > 0;
        };

        s.lock = function(key) {
            locks[key] = true;
            renderer.renderLocked();
        };

        s.unlock = function(key) {
            delete locks[key];
            if (!s.isLocked()) {
                renderer.renderOpen();
            }
        };
    }


    function DoorRenderer(s) {

      var layer = s.renderer.getLayer('objects');
      var rect = s.body.getRectangle();

      var tileWidth = s.map.mapData.tilewidth;
      var tileHeight = s.map.mapData.tileheight;

      var g = s.renderer.createGraphic();
      g.beginFill(0xD10000);
      g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                 rect.w * tileWidth, rect.h * tileHeight);
      g.endFill();
      layer.addChild(g);
      g.visible = false;

      s.renderOpen = function() {
        g.visible = false;
      };

      s.renderLocked = function() {
        g.visible = true;
      };
    }

    return Door;
});
