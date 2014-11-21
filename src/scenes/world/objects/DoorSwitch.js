define(['../Body'], function(Body) {

    function DoorSwitchPlugin(s) {
        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        for (var i = 0, ii = s.map.objectlayers.length; i < ii; i++) {
            var layer = s.map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('DoorSwitch')) {

                    var x = obj.x / tileWidth;
                    var y = obj.y / tileHeight;
                    var w = obj.w / tileWidth;
                    var h = obj.h / tileHeight;

                    s.create(DoorSwitch, obj, x, y, w, h);
                }
            }
        }
    }


    function DoorSwitch(s, obj, x, y, w, h) {
        s.body = s.create(Body, x, y, w, h, false);
        var renderer = s.create(DoorSwitchRenderer);

        var door;

        s.body.on('player collision', function() {
          door.unlock(obj.name);
          renderer.renderOn();
        });

        s.on('loaded', function() {
          // TODO sounds.movingBlock.play();
          door = s.objects[obj.target];
          door.lock(obj.name);
        });
    }


    function DoorSwitchRenderer(s) {

      var layer = s.renderer.getLayer('objects');
      var rect = s.body.getRectangle();

      var tileWidth = s.map.mapData.tilewidth;
      var tileHeight = s.map.mapData.tileheight;

      var g = s.renderer.createGraphic();
      g.beginFill(0xDDDDDD);
      g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                 rect.w * tileWidth, rect.h * tileHeight);
      g.endFill();

      layer.addChild(g);

      s.renderOn = function() {
          g.clear();
          g.beginFill(0x333333);
          g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                     rect.w * tileWidth, rect.h * tileHeight);
          g.endFill();
      };

      s.renderOff = function() {
          g.clear();
          g.beginFill(0xDDDDDD);
          g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                     rect.w * tileWidth, rect.h * tileHeight);
          g.endFill();
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
