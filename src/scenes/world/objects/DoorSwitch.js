define(['../Body'], function(Body) {

    function DoorSwitch(s, obj) {
        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, false);
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

    return DoorSwitch;
});

/*
function setupSounds(sounds: Sounds) {
  sounds.movingBlock = sounds.create({
    urls: ['media/sounds/blocks-moving.wav'],
  });
}
*/
