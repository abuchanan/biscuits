
// Ripped from PIXI.SpriteBatch
function TileBatchRenderable(forEachTile) {
  PIXI.DisplayObject.call(this);
  this.renderable = true;
  this.forEachTile = forEachTile;
}
TileBatchRenderable.prototype = Object.create(PIXI.DisplayObject.prototype);
TileBatchRenderable.prototype.constructor = TileBatchRenderable;

TileBatchRenderable.prototype._renderCanvas = function(renderSession) {

  var context = renderSession.context;
  context.globalAlpha = this.worldAlpha;
  PIXI.DisplayObject.prototype.updateTransform.call(this);
  var transform = this.worldTransform;
  // alow for trimming
  var isRotated = true;

  this.forEachTile(function(tile) {
    var child = tile.getRenderable();
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

TileBatchRenderable.prototype._renderWebGL = function(renderSession) {
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

  this.forEachTile(function(tile) {
    var sprite = tile.getRenderable();
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
