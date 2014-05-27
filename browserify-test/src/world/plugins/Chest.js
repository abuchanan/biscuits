'use strict';

exports.registerWorldLoaderPlugin = function(loader) {

  loader.events.addListener('load chest', function(obj, scene) {
    // TODO contain things other than coins
    var value = obj.coinValue || 1;

    /*
    var g = new PIXI.Graphics();
    g.beginFill(0x00FFFF);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);
    */
    var worldObj = scene.world.add(obj.x, obj.y, obj.w, obj.h);
    worldObj.isBlock = true;
    var isOpen = false;

    worldObj.events.on('use', function(player) {
      if (!isOpen) {
        isOpen = true;
        player.coins += value;

        /*
        g.clear();
        g.beginFill(0x0000FF);
        g.drawRect(x, y, w, h);
        g.endFill();
        */
      }
    });
  });
};
