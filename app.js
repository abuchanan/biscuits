'use strict';

function SceneManager() {

  return {
    _scenes: {},
    _unload: false,

    // no-op
    render: function() {},
    addScene: function(name, sceneFunction) {
      this._scenes[name] = sceneFunction;
    },
    load: function(name) {
      if (this._unload) {
        this._unload();
      }
      this._unload = this._scenes[name]();
    },
  }
}


function startBiscuits(container) {

// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0xffffff);

	// create a renderer instance
	var renderer = new PIXI.WebGLRenderer(640, 640);
  //autoDetectRenderer(400, 300);

	// add the renderer view element to the DOM
	container.appendChild(renderer.view);

	requestAnimFrame(animate);

  var masterContainer = new PIXI.DisplayObjectContainer();
  stage.addChild(masterContainer);

	function animate() {
	    requestAnimFrame( animate );
      sceneManager.render();
	    renderer.render(stage);
	}

  var sceneManager = SceneManager();

  var worldFiles = ['foo6.json', 'other1.json', 'bar2.json'];
  var worlds = [];

  for (var i = 0; i < worldFiles.length; i++) {
    var file = worldFiles[i];
    var worldContainer = new PIXI.DisplayObjectContainer();
    masterContainer.addChild(worldContainer);
    worldContainer.visible = false;
    var world = loadWorld(file, sceneManager, worldContainer);
    worlds.push(world);
  }

  Q.all(worlds).then(function() {
    //sceneManager.load('bar.main');
    sceneManager.load('main');
  })
  .fail(function(reason) {
    console.log(reason);
  });
}


function CanvasLayersRenderer(canvas, layers) {
  var ctx = canvas.getContext('2d');

  return function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0, ii = layers.length; i < ii; i++) {
      layers[i].render(ctx);
    }
  }
}
