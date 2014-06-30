import {SceneScope} from 'src/scope';
import {Scene} from 'src/scene';
import PIXI from 'lib/pixi';

export {RendererConfig, Renderer};

// TODO @SceneScope?
class RendererConfig {
  // TODO inject document?
  constructor() {
    this.container = document.body;
  }
}

@SceneScope
class Renderer {

  constructor(config: RendererConfig, scene: Scene) {
    var renderer = this.renderer = PIXI.autoDetectRenderer();
    var stage = this.stage = new PIXI.Stage(0xffffff);
    // TODO this was causing an error. why?
    this.stage.interactive = false;

    var layers = this._layers = {};
    var layerNames = config.layers || [];
    layerNames.forEach((name) => {
      var layer = layers[name] = new PIXI.DisplayObjectContainer();

      // TODO 
      layer.width = renderer.width;
      layer.height = renderer.height;

      stage.addChild(layer);
    });

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

  getLayer(name) {
    var layer = this._layers[name];
    if (layer) {
      return layer;
    } else {
      throw `Unknown layer: ${name}`;
    }
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
