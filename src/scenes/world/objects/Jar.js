define(['../Body'], function(Body) {

    function Jar(s, obj) {
        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, true);

        s.mixin(JarRenderer);

        s.body.on('hit', function() {
            console.log('jar hit');
            s.destroy();
        });
    }

    function JarRenderer(s) {
        var layer = s.renderer.getLayer('objects');
        var rect = s.body.getRectangle();

        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        var g = s.renderer.createGraphic();
        g.beginFill(0x994D00);
        g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                   rect.w * tileWidth, rect.h * tileHeight);
        g.endFill();
        layer.addChild(g);

        s.on('destroy', function() {
            layer.removeChild(g);
        });
    }

    return Jar;
});
