'use strict';

define(function(WorldLoader, player) {

  function create(x, y, w, h, world, container) {
    var g = new PIXI.Graphics();
    g.beginFill(0x00FFFF);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);

    var isOpen = false;

    var worldObj = world.add(x, y, w, h);
    worldObj.isBlock = true;

    worldObj.on('use', function() {
      if (!isOpen) {
        isOpen = true;

        g.clear();
        g.beginFill(0x0000FF);
        g.drawRect(x, y, w, h);
        g.endFill();

        player.coins += 5;
      }
    });
  }

  WorldLoader.addHandler('chest', function(world, obj, container) {
    create(obj.x, obj.y, obj.w, obj.h, world, container);
  });

  // TODO separate chest renderable from chest service?
  return {
    enable: function() {},
    disable: function() {},
    // TODO needed? create: function(x, y, w, h) {
  }
});
