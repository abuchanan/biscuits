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


function startBiscuits(canvas) {

  var sceneManager = SceneManager();
  Q.all([
    //loadWorld('foo6.json', sceneManager),
    //loadWorld('other1.json', sceneManager),
    loadWorld('bar2.json', sceneManager),

  ]).then(function() {
    sceneManager.load('bar.main');
    sceneManager.start();

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
