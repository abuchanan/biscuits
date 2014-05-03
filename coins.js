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

      // TODO this doesn't have anchor. :( this is getting confusing
      g.position.x = x - (w / 2);
      g.position.y = y - (h / 2);

      var coin = {
        coin: true,
        use: function() {
          container.removeChild(g);
          player.coins += value;
        },
      };

      world.addBox(x, y, w, h, coin, {
        type: 'static',
        collisionCategories: ['playerItem'],
        sensor: true,
      });
      container.addChild(g);
    }
  }
}
