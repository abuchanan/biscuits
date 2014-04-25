function CoinsService(player, world, container) {

  // Coin handling
  world.contactListener(player, function(fixture) {
    if (fixture.objectData.coin) {
        fixture.objectData.use();
        world.remove(fixture);
    }
  });

  return {
    create: function(x, y, w, h) {
      var value = 1;

      var g = new PIXI.Graphics();
      g.beginFill(0xF0F074);
      g.drawRect(0, 0, w, h);
      g.endFill();

      g.position.x = x;
      g.position.y = y;

      var coin = {
        coin: true,
        use: function() {
          container.removeChild(g);
          player.coins += value;
        },
      };

      world.addStatic(coin, x, y, w, h);
      container.addChild(g);
    }
  }
}
