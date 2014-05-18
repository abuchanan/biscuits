'use strict';

define(['biscuits'], function(biscuits) {
	var renderer = PIXI.autoDetectRenderer();

  // TODO it might be worth trying to get rid of the master layer
  //      and have layers added directly to stage
  var masterLayer = new Layers();
	var stage = new PIXI.Stage(0xffffff);
  stage.addChild(masterLayer);

  // TODO work with start/stop
  var removeListener = biscuits.addListener('renderFrame', function() {
    masterLayer.invokeFrameListeners();
    renderer.render(stage);
  });

  return {
    getViewDOM: function() {
      return renderer.view;
    },

    newLayer: function() {
      return masterLayer.newLayer();
    },

    setSize: function(width, height) {
      renderer.width = width;
      renderer.height = height;
    },

    start: function(loadPoint) {
      stage.visible = true;
    },

    stop: function() {
      stage.visible = false;
      removeListener();
    },
  };
});
