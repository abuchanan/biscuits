import PIXI from 'lib/pixi';

export {loadSpriteSheetSync};

// TODO re-implement async request
function loadSpriteSheetSync(imageSrc, jsonSrc) {
  //var deferred = Q.defer();

  // create a texture from an image path
  var texture = PIXI.Texture.fromImage(imageSrc);

  var req = new XMLHttpRequest();
  /*
  req.onload = function() {
    var d = JSON.parse(this.responseText);
    var data = {};

    for (var i = 0; i < d.frames.length; i++) {
      var frame = d.frames[i];
      var x = frame.frame.x * -1;
      var y = frame.frame.y * -1;
      var w = frame.frame.w;
      var h = frame.frame.h;

      var r = new PIXI.Rectangle(x, y, w, h);
      var part = new PIXI.Texture(texture, r);
      // TODO hard-coded
      var name = frame.filename.replace('.png', '');
      data[name] = part;
    }

    deferred.resolve(data);
  };
  */

  // TODO if this request fails, the whole app will hang
  req.responseType = 'application/json';
  req.overrideMimeType('application/json');
  req.open('get', jsonSrc, false);
  req.send();

  var data = {};
  var d = JSON.parse(req.responseText);

  for (var i = 0; i < d.frames.length; i++) {
    var frame = d.frames[i];
    var x = frame.frame.x * -1;
    var y = frame.frame.y * -1;
    var w = frame.frame.w;
    var h = frame.frame.h;

    var r = new PIXI.Rectangle(x, y, w, h);
    var part = new PIXI.Texture(texture, r);
    // TODO hard-coded
    var name = frame.filename.replace('.png', '');
    data[name] = part;
  }

  return data;
}
