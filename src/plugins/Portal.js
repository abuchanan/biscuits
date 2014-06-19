'use strict';

exports.registerWorldLoaderPlugin = function(loader) {
  // TODO player jumps through portal with the slightest overlap.
  //      would be nicer to wait until the player is overlapping more
  //      so it feels like you're *in* the portal

  loader.events.addListener('load portal', function(def, worldObj, scene) {
    var body = scene.world.add(def.x, def.y, def.w, def.h);
    // TODO test this
    worldObj.events.on('player collision', function() {
      scene.events.trigger('load scene: ' + def.portalDestination);
    });

    /*
    TODO

    var g = new PIXI.Graphics();
    g.beginFill(0x00ffaa);
    g.drawRect(obj.x, obj.y, obj.w, obj.h);
    g.endFill();
    scene.container.addChild(g);
    */
  });
};
