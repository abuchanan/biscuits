'use strict';

define(function(WorldLoader) {
  
  WorldLoader.addHandler('block', function(world, obj) {
    var obj = world.add(obj.x, obj.y, obj.w, obj.h);
    obj.isBlock = true;
  });
});
