
function Sprite(image, x, y, w, h) {
  this.image = image;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}
Sprite.prototype = {
  render: function(ctx, x, y, w, h) {
    ctx.drawImage(this.image,
                  // source image x, y
                  this.x, this.y,
                  // source image width, height
                  this.w, this.h,
                  // destination x, y
                  x, y,
                  // destination width, height
                  w, h);
  }
};


function SpriteSheet(image) {
  this.image = image;
}
SpriteSheet.prototype = {
  slice: function(x, y, w, h) {
    return new Sprite(this.image, x, y, w, h);
  }
};


function loadSpriteSheet(src) {
  var deferred = Q.defer();

  var img = new Image();

  img.onload = function() {
    var sprite = new SpriteSheet(img);
    deferred.resolve(sprite);
  }
  img.src = src;
  
  return deferred.promise;
}


function SpriteAnimation(sprites) {
  this.sprites = sprites;
  this._frame_i = 0;
}
SpriteAnimation.prototype = {
  render: function(ctx, x, y, w, h) {
    var duration = 30;
    var sprite_i = Math.floor(this._frame_i / duration) % this.sprites.length;

    this.sprites[sprite_i].render(ctx, x, y, w, h);

    this._frame_i += 1;
  },
};
