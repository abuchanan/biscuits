define(['../Body'], function(Body) {


    function Door(s, obj) {

        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, true);
                  
        var locks = {};
        var renderer = s.create(DoorRenderer);

        s.body.on('player collision', function(playerBody) {
          // TODO this is a weird case. Feels very hard-coded to both
          //      a global player and a "generic" key/lock name
          //
          //      maybe want a plugin to be able to observe collisions
          //      between to foreign objects (player and door)
          if (s.isLocked() && locks['generic']) {
              if (s.player.keys.balance() > 0) {
                  s.player.keys.withdraw(1);
                  s.unlock('generic');
              }
          }

          if (!s.isLocked()) {
            s.start(obj.Destination);
          }
        });

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

        if (obj.locks) {
            var l = obj.locks.split(/[, ]+/);
            for (var i = 0; i < l.length; i++) {
                s.lock(l[i]);
            }
        }
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
