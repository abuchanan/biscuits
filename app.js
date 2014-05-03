'use strict';

function SceneManager() {

  var unload = false;
  var scenes = {};

  return {
    // no-op
    onFrame: function() {},
    addScene: function(name, sceneFunction) {
      scenes[name] = sceneFunction;
    },
    load: function(name) {
      if (unload) {
        unload();
      }
      unload = scenes[name]();
    },
  }
}


function Layers() {
  PIXI.DisplayObjectContainer.call(this);
}
Layers.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Layers.prototype.constructor = Layers;
Layers.prototype.newLayer = function() {
  var layer = new Layers();
  this.addChild(layer);
  return layer;
};


function startBiscuits(container) {

// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0xffffff);

	// create a renderer instance
  var width = 640;
  var height = 640;
	var renderer = new PIXI.WebGLRenderer(width, height);
  //autoDetectRenderer(400, 300);

	// add the renderer view element to the DOM
	container.appendChild(renderer.view);

	requestAnimFrame(animate);

  var masterLayer = new Layers();
  stage.addChild(masterLayer);

	function animate() {
	    requestAnimFrame( animate );
      sceneManager.onFrame();
	    renderer.render(stage);
	}

  var sceneManager = SceneManager();

  var worldFiles = [
    'maps/foo8.json',
    //'maps/other1.json',
    //'maps/bar2.json',
  ];
  var worlds = [];

  for (var i = 0; i < worldFiles.length; i++) {
    var file = worldFiles[i];
    var worldLayer = masterLayer.newLayer();
    masterLayer.addChild(worldLayer);
    worldLayer.visible = false;
    var world = loadWorld(file, sceneManager, worldLayer);
    worlds.push(world);
  }

  var stageLayer = masterLayer.newLayer();
  loadStage(sceneManager, stageLayer);

  Q.all(worlds).then(function() {
    //sceneManager.load('bar.main');
    sceneManager.load('main');
  })
  .fail(function(reason) {
    console.log(reason);
  });
}
