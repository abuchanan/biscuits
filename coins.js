function CoinsService(player, world, container) {

  return {
    create: function(x, y, w, h) {
      // TODO configurable value
      var value = 1;

      var g = new PIXI.Graphics();
      g.beginFill(0xF0F074);
      g.drawRect(x, y, w, h);
      g.endFill();
      container.addChild(g);

      var coin = {
        coin: true,
      };

      var worldObj = world.add(x, y, w, h);
      worldObj.data = coin;

      worldObj.onCollision = function(obj) {
        if (obj.data === player) {
          worldObj.remove();
          player.coins += value;
          container.removeChild(g);
        }
      };

      // TODO even need to return coin?
      return coin;
    }
  }
}
