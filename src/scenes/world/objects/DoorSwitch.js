define(['../Body'], function(Body) {

    function DoorSwitchPlugin(scene) {
        var map = scene.map;
        var tileWidth = scene.map.mapData.tilewidth;
        var tileHeight = scene.map.mapData.tileheight;

        function configureLock(obj, body, renderer) {
          var door;

          body.events.on('player collision', function() {
            door.unlock(obj.name);
            renderer.renderOn();
          });

          scene.events.on('loaded', function() {
            // TODO sounds.movingBlock.play();
            door = scene.doors[obj.target];
            door.lock(obj.name);
          });
        }

        for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
            var layer = map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('DoorSwitch')) {

                    var x = obj.x / tileWidth;
                    var y = obj.y / tileHeight;
                    var w = obj.w / tileWidth;
                    var h = obj.h / tileHeight;
                    var body = Body(x, y, w, h, false, scene.world);
                    var renderer = DoorSwitchRenderer(scene, body);
                    configureLock(obj, body, renderer);
                }
            }
        }
    }


    function DoorSwitchRenderer(scene, body) {

      var layer = scene.renderer.getLayer('objects');
      var rect = body.getRectangle();
      var map = scene.map;
      var tileWidth = scene.map.mapData.tilewidth;
      var tileHeight = scene.map.mapData.tileheight;

      var g = scene.renderer.createGraphic();
      g.beginFill(0xDDDDDD);
      g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                 rect.w * tileWidth, rect.h * tileHeight);
      g.endFill();
      layer.addChild(g);

      return {
        renderOn: function() {
          g.clear();
          g.beginFill(0x333333);
          g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                     rect.w * tileWidth, rect.h * tileHeight);
          g.endFill();
        },
        renderOff: function() {
          g.clear();
          g.beginFill(0xDDDDDD);
          g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                     rect.w * tileWidth, rect.h * tileHeight);
          g.endFill();
        }
      };
    }

    return DoorSwitchPlugin;
});

/*
function setupSounds(sounds: Sounds) {
  sounds.movingBlock = sounds.create({
    urls: ['media/sounds/blocks-moving.wav'],
  });
}
*/
