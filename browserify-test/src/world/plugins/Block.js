'use strict';

exports.registerWorldLoaderPlugin = function(loader) {
  loader.events.addListener('load block', function(obj, scene) {
    var worldObj = scene.world.add(obj.x, obj.y, obj.w, obj.h);
    worldObj.isBlock = true;
  });
};
