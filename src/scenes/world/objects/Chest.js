define(['../Body'], function(Body) {

    function Chest(s, obj) {
        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, true);
        s.isOpen = false;

        var chestRenderer = s.create(ChestRenderer);

        s.body.on('use', function(player) {
          if (!s.isOpen) {
            s.isOpen = true;
            chestRenderer.renderOpened();
            s.trigger('chest opened', [player]);
          }
        });
    }


    function ChestRenderer(s) {
        var layer = s.renderer.getLayer('objects');
        var rect = s.body.getRectangle();

        // TODO handle isOpen == true on initialization

        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        var g = s.renderer.createGraphic();
        g.beginFill(0x00FFFF);
        g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                   rect.w * tileWidth, rect.h * tileHeight);
        g.endFill();
        layer.addChild(g);

        s.renderOpened = function() {
            g.clear();
            g.beginFill(0x0000FF);
            g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                       rect.w * tileWidth, rect.h * tileHeight);
            g.endFill();
        };
    }

    return Chest;
});
