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

  var masterContainer = new PIXI.DisplayObjectContainer();
  stage.addChild(masterContainer);

	function animate() {
	    requestAnimFrame( animate );
      sceneManager.onFrame();
	    renderer.render(stage);
	}

  var sceneManager = SceneManager();

  var worldFiles = ['maps/foo8.json', 'maps/other1.json', 'maps/bar2.json'];
  var worlds = [];

  for (var i = 0; i < worldFiles.length; i++) {
    var file = worldFiles[i];
    var worldContainer = new PIXI.DisplayObjectContainer();
    masterContainer.addChild(worldContainer);
    worldContainer.visible = false;
    var world = loadWorld(file, sceneManager, worldContainer);
    worlds.push(world);
  }

  var stageContainer = new PIXI.DisplayObjectContainer();
  masterContainer.addChild(stageContainer);
  loadStage(sceneManager, stageContainer);

  Q.all(worlds).then(function() {
    //sceneManager.load('bar.main');
    sceneManager.load('main');
  })
  .fail(function(reason) {
    console.log(reason);
  });
}
