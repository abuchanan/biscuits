define(['../Body'], function(Body) {


    function DoorPlugin(scene) {
        var map = scene.map;
        var tileWidth = scene.map.mapData.tilewidth;
        var tileHeight = scene.map.mapData.tileheight;
        var doors = {};

        for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
            var layer = map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Door')) {
                  var x = obj.x / tileWidth;
                  var y = obj.y / tileHeight;
                  var w = obj.w / tileWidth;
                  var h = obj.h / tileHeight;

                  var body = Body(x, y, w, h, true, scene.world);
                  var door = Door(body, obj, scene);
                  DoorRenderer(door, body, scene);
                  doors[obj.name] = door;
                }
            }
        }

        scene.doors = doors;
    }


    function Door(body, obj, scene) {

        body.events.on('player collision', function(playerBody) {
          if (!isLocked()) {
            scene.start(obj.Destination);
          }
        });

        var locks = {};

        function isLocked() {
            return Object.keys(locks).length > 0;
        }

        function lock(key) {
            locks[key] = true;
        }

        function unlock(key) {
            delete locks[key];
        }

        return {
            lock: lock,
            unlock: unlock,
            isLocked: isLocked,
        };
    }


    function DoorRenderer(door, body, scene) {

      var layer = scene.renderer.getLayer('objects');
      var rect = body.getRectangle();
      var map = scene.map;
      var tileWidth = scene.map.mapData.tilewidth;
      var tileHeight = scene.map.mapData.tileheight;

      var g = scene.renderer.createGraphic();
      g.beginFill(0xD10000);
      g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                 rect.w * tileWidth, rect.h * tileHeight);
      g.endFill();
      layer.addChild(g);

      scene.events.on('tick', function() {
        g.visible = door.isLocked();
      });
    }

    return DoorPlugin;
});
