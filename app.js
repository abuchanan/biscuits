'use strict';

function SceneManager() {

  function startRenderLoop(renderFunction) {
    function handleFrame() {
      renderFunction();
      requestAnimationFrame(handleFrame);
    }
    requestAnimationFrame(handleFrame);
  }

  return {
    _scenes: {},
    _unload: false,

    // no-op
    render: function() {},
    start: function() {
      // TODO could let the scene decide which renderer to use
      var canvasRenderer = CanvasLayersRenderer(canvas, [
        this,
      ]);

      startRenderLoop(function() {
        canvasRenderer();
      });
    },
    addScene: function(name, sceneFunction) {
      this._scenes[name] = sceneFunction;
    },
    load: function(name) {
      console.log(name);
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
	var renderer = new PIXI.WebGLRenderer(500, 500);
  //autoDetectRenderer(400, 300);

	// add the renderer view element to the DOM
	container.appendChild(renderer.view);

	requestAnimFrame(animate);

  var objContainer = new PIXI.DisplayObjectContainer();
  stage.addChild(objContainer);

	function animate() {

	    requestAnimFrame( animate );

	    // render the stage
	    renderer.render(stage);
      sceneManager.render();
	}

  var sceneManager = SceneManager();
  Q.all([
    //loadWorld('foo6.json', sceneManager),
    //loadWorld('other1.json', sceneManager),
    loadWorld('bar2.json', sceneManager, objContainer),

  ]).then(function() {
    //sceneManager.load('bar.main');
    sceneManager.load('box2dtest');

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
