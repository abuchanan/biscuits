define(['../Body'], function(Body) {

    function Coin(s, obj) {
      s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, false);
      var value = parseInt(obj.coinValue) || 1;

      s.mixin(CoinRenderer);

      s.body.on('player collision', function(playerBody) {
        // TODO move away from using global player object, so that a future
        //      move to multiplayer would be easier
        s.player.coins.deposit(value);
        s.destroy();
      });
    }

    function CoinRenderer(s) {
        var layer = s.renderer.getLayer('objects');
        var rect = s.body.getRectangle();

        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        var g = s.renderer.createGraphic();
        g.beginFill(0xF0F074);
        g.drawRect(rect.x * tileWidth, rect.y * tileHeight,
                   rect.w * tileWidth, rect.h * tileHeight);
        g.endFill();
        layer.addChild(g);

        s.on('destroy', function() {
          layer.removeChild(g);
        });
    }

    return Coin;
});
