define(function(WorldLoader) {

  function create(x, y, w, h, value, world, container) {
    value = value || 1;

    var g = new PIXI.Graphics();
    g.beginFill(0xF0F074);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);

    var worldObj = world.add(x, y, w, h);

    worldObj.addListener('player collision', function(player) {
      worldObj.remove();
      // TODO maybe player.addCoins would be better
      player.coins += value;
      container.removeChild(g);
    });
  }

  WorldLoader.addHandler('coin', function(world, obj, container) {
    create(obj.x, obj.y, obj.w, obj.h, obj.coinValue, world, container);
  });

  return {
    enable: function() {},
    disable: function() {},
    // TODO needed? create: create,
  }
});
