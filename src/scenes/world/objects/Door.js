define(['../Body'], function(Body) {


    function DoorPlugin(s) {
        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        for (var i = 0, ii = s.map.objectlayers.length; i < ii; i++) {
            var layer = s.map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Door')) {
                  var x = obj.x / tileWidth;
                  var y = obj.y / tileHeight;
                  var w = obj.w / tileWidth;
                  var h = obj.h / tileHeight;

                  s.objects[obj.name] = s.create(Door, obj, x, y, w, h);
                }
            }
        }
    }


    function Door(s, obj, x, y, w, h) {

        s.body = s.create(Body, x, y, w, h, true);
                  
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

    return DoorPlugin;
});
