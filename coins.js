function CoinsService(player, world, container) {

  return {
    create: function(x, y, w, h, value) {
      value = value || 1;

      var g = new PIXI.Graphics();
      g.beginFill(0xF0F074);
      g.drawRect(x, y, w, h);
      g.endFill();
      container.addChild(g);

      var worldObj = world.add(x, y, w, h);

      worldObj.onCollision = function(obj) {
        if (obj.data === player) {
          worldObj.remove();
          player.coins += value;
          container.removeChild(g);
        }
      };
    }
  }
}
