import {Inject} from 'di';
import PIXI from 'lib/pixi';
export {RenderConfig, Renderer};

class RenderConfig {}

@Inject(RenderConfig)
class Renderer {

  constructor(config) {
    this.renderer = PIXI.autoDetectRenderer();
    this.stage = new PIXI.Stage(0xffffff);
    this._layers = {};
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
