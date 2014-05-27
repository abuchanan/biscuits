'use strict';

exports.registerWorldLoaderPlugin = function(loader) {
  // TODO player jumps through portal with the slightest overlap.
  //      would be nicer to wait until the player is overlapping more
  //      so it feels like you're *in* the portal

  loader.events.addListener('load portal', function(obj, scene) {
    var worldObj = scene.world.add(obj.x, obj.y, obj.w, obj.h);
    var load = scene.load.bind(scene, obj.portalDestination);
    worldObj.events.on('player collision', load);

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
