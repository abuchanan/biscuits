import PIXI from 'lib/pixi';
import {Renderer} from 'src/render';
import {ImageGrid} from 'src/ImageGrid';
import {Scene} from 'src/scene';
import {SceneScope} from 'src/scope';
import {Map} from 'src/maploader';

export {BackgroundRenderer, BackgroundGrid};


@SceneScope
class BackgroundGrid {

  constructor(map: Map) {

    var grid = this.grid = [];

    map.tilelayers.forEach((layer) => {
      layer.forEach((sprite) => {
        grid.push(sprite);
      });
    });

  }

  forEach(cb) {
    this.grid.forEach(cb);
  }
}

@SceneScope
function BackgroundRenderer(renderer: Renderer, grid: BackgroundGrid) {
  var layer = renderer.getLayer('background');
  // TODO figure out how to inject TileBatchRenderable
  var renderable = new TileBatchRenderable(grid.forEach.bind(grid));
  layer.addChild(renderable);

  // TODO fix active background region. separate it from renderer.
  //var region = new ActiveBackgroundRegion(layer.width, layer.height, tiles);
  // region.setAnchor(0.5, 0.5);

  // TODO handle container resize
}


class ActiveBackgroundRegion {

  constructor(width, height, tiles) {
    this._x = 0;
    this._y = 0;
    this._width = width;
    this._height = height;
    this._tiles = tiles;
    // TODO should this fetch the initial area, or wait for setPosition?

    this._anchorX = 0;
    this._anchorY = 0;
  }

  _prefetch() {
    var rx = this._x - this._width * this._anchorX;
    var ry = this._y - this._height * this._anchorY;
    this._tiles.prefetch(rx, ry, this._width, this._height);
  }

  forEachTile(callback) {
    var rx = this._x - this._width * this._anchorX;
    var ry = this._y - this._height * this._anchorY;
    this._tiles.query(rx, ry, this._width, this._height, callback);
  }

  getPosition() {
    return {x: this._x, y: this._y};
  }

  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._prefetch();
  }

  setAnchor(dx, dy) {
    this._anchorX = dx;
    this._anchorY = dy;
  }

  resize(w, h) {
    this._width = w;
    this._height = h;
    this._prefetch();
  }
}


// Ripped from PIXI.SpriteBatch
class TileBatchRenderable extends PIXI.DisplayObject {

  constructor(forEachTile) {
    super();
    this.renderable = true;
    this.forEachTile = forEachTile;
  }

  _renderCanvas(renderSession) {

    var context = renderSession.context;
    context.globalAlpha = this.worldAlpha;
    PIXI.DisplayObject.prototype.updateTransform.call(this);
    var transform = this.worldTransform;
    // alow for trimming
    var isRotated = true;

    this.forEachTile(function(child) {
      // Maybe the sprite isn't loaded.
      if (!child) {
        return;
      }
         
      if (!child.visible) {
        return;
      }

      var texture = child.texture;
      var frame = texture.frame;

      context.globalAlpha = this.worldAlpha * child.alpha;

      if (child.rotation % (Math.PI * 2) === 0) {
        if (isRotated) {
          context.setTransform(transform.a, transform.c,
                               transform.b, transform.d,
                               transform.tx, transform.ty);
          isRotated = false;
        }

        // this is the fastest  way to optimise!
        // if rotation is 0 then we can avoid any kind of setTransform call
        context.drawImage(texture.baseTexture.source,
                          frame.x,
                          frame.y,
                          frame.width,
                          frame.height,
                          ((child.anchor.x) * (-frame.width * child.scale.x) +
                           child.position.x  + 0.5) | 0,
                          ((child.anchor.y) * (-frame.height * child.scale.y) +
                           child.position.y  + 0.5) | 0,
                          frame.width * child.scale.x,
                          frame.height * child.scale.y);

      } else {

          if (!isRotated) {
            isRotated = true;
          }

          PIXI.DisplayObject.prototype.updateTransform.call(child);
          var childTransform = child.worldTransform;
          // allow for trimming
         
          if (renderSession.roundPixels) {
            context.setTransform(childTransform.a, childTransform.c,
                                 childTransform.b, childTransform.d,
                                 childTransform.tx | 0,
                                 childTransform.ty | 0);
          } else {
            context.setTransform(childTransform.a, childTransform.c,
                                 childTransform.b, childTransform.d,
                                 childTransform.tx, childTransform.ty);
          }

          context.drawImage(texture.baseTexture.source,
                            frame.x,
                            frame.y,
                            frame.width,
                            frame.height,
                            ((child.anchor.x) * (-frame.width) + 0.5) | 0,
                            ((child.anchor.y) * (-frame.height) + 0.5) | 0,
                            frame.width,
                            frame.height);
      }
    });
  }

  _renderWebGL(renderSession) {
    
    if (!this.visible || this.alpha <= 0) {
      return;
    }

    var fsb = this.fastSpriteBatch;

    if (!fsb) {
      fsb = new PIXI.WebGLFastSpriteBatch(renderSession.gl);
      this.fastSpriteBatch = fsb;
    }
    
    renderSession.spriteBatch.stop();
    var shaderMan = renderSession.shaderManager;
    shaderMan.activateShader(shaderMan.fastShader);
    
    fsb.begin(this, renderSession);

    this.forEachTile(function(sprite) {
      // Maybe the sprite isn't loaded.
      if (!sprite) {
        return;
      }

      // if the uvs have not updated then no point rendering just yet!
      if (sprite.texture._uvs) {
        fsb.currentBaseTexture = sprite.texture.baseTexture;
        // check blend mode
        if (sprite.blendMode !== fsb.currentBlendMode) {
          fsb.setBlendMode(sprite.blendMode);
        }
        
        fsb.renderSprite(sprite);
      }
    });
    fsb.flush();

    shaderMan.activateShader(shaderMan.defaultShader);
    renderSession.spriteBatch.start();
  }
}
