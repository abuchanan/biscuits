import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';
import PIXI from 'lib/pixi';

export {RenderConfig, Renderer};

// TODO @SceneScope?
class RenderConfig {
  // TODO inject document?
  constructor() {
    this.container = document.body;
  }
}

@SceneScope
class Renderer {

  constructor(config: RenderConfig, scene: Scene) {
    var renderer = this.renderer = PIXI.autoDetectRenderer();
    var stage = this.stage = new PIXI.Stage(0xffffff);
    // TODO this was causing an error. why?
    this.stage.interactive = false;
    this._layers = {};

    config.container.appendChild(renderer.view);

    scene.events.on('scene tick', function() {
      renderer.render(stage);
    });
  }

  getViewDOM() {
    return this.renderer.view;
  }

  render() {
    // TODO this.masterLayer.invokeFrameListeners();
    this.renderer.render(this.stage);
  }

  // TODO layer ordering
  getLayer(name) {
    var layer = this._layers[name];
    if (layer) {
      return layer;
    }

    layer = this._layers[name] = new PIXI.DisplayObjectContainer();

    // TODO 
    layer.width = this.renderer.width;
    layer.height = this.renderer.height;

    this.stage.addChild(layer);
    return layer;
  }

  createGraphic() {
    return new PIXI.Graphics();
  }

  /* TODO
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
  */
}
