'use strict';


// TODO a 3D index would be better than an array of indices.
function World(numLayers) {

  // TODO document "3" and make it easily configurable?
  this._index = [];
  for (var i = 0; i < numLayers; i++) {
    this._index[i] = rbush(3);
  }
}
World.prototype = {

  add: function(object, layerIdx, position, w, h) {

    w = w || 1;
    h = h || 1;

    var layer = this._index[layerIdx];
    if (!layer) {
      throw 'Missing layer ' + layerIdx;
    }

    var item;

    function insert() {
      var x = position.getX();
      var y = position.getY();
      var mX = x + w - 1;
      var mY = y + h - 1;
      item = [x, y, mX, mY, object];
      layer.insert(item);
    }

    insert();

    position.onChange(function(pos) {
      layer.remove(item);
      insert();
    });
  },

  query: function(x, y, maxX, maxY) {
    var mX = maxX || x;
    var mY = maxY || y;

    var q = [x, y, mX, mY];
    var items = [];

    for (var i = 0, ii = this._index.length; i < ii; i++) {
      var res = this._index[i].search(q);
      items.push.apply(items, res);
    }
    return items;
  },

  isBlocked: function(x, y) {
    var items = this.query(x, y);

    for (var i = 0, ii = items.length; i < ii; i++) {
      // TODO handling query results is a little clunky
      var obj = items[i][4];

      if (obj.isBlock) {
        return false;
      }
    }
    return true;
  },
};


function WorldView(world, width, height) {
  this.world = world;
  this.width = width;
  this.height = height;
  this.position = new Position(0, 0);
}

WorldView.prototype = {

  handlePlayerPositionChange: function(playerPosition) {
    var playerX = playerPosition.getX();
    var playerY = playerPosition.getY();
    var viewX = this.position.getX();
    var viewY = this.position.getY();
    var viewWidth = this.width;
    var viewHeight = this.height;

    // Player is at the right edge
    if (playerX == viewX + viewWidth - 1) {
      this.shiftRight();

    // Player is at the left edge
    } else if (playerX == viewX) {
      this.shiftLeft();

    // Player is at the top edge
    } else if (playerY == viewY) {
      this.shiftUp();

    // Player is at the bottom edge
    } else if (playerY == viewY + viewHeight - 1) {
      this.shiftDown();
    }
  },

  items: function() {
    var viewX = this.position.getX();
    var viewY = this.position.getY();
    return this.world.query(viewX, viewY,
                            viewX + this.width - 1, viewY + this.height - 1);
  },

  // TODO need to be careful about shifting out of bounds
  shiftRight: function() {
    this.position.setX(this.position.getX() + this.width - 2);
  },
  shiftLeft: function() {
    this.position.setX(this.position.getX() - this.width + 2);
  },
  shiftUp: function() {
    this.position.setY(this.position.getY() - this.height + 2);
  },
  shiftDown: function() {
    this.position.setY(this.position.getY() + this.height - 2);
  },

  // TODO blank tile handling?
  render: function(ctx) {

    var tileWidth = ctx.canvas.width / this.width;
    var tileHeight = ctx.canvas.height / this.height;

    var viewX = this.position.getX();
    var viewY = this.position.getY();
    var items = this.items();

    for (var i = 0, ii = items.length; i < ii; i++) {
      var item = items[i];

      /*
        An item's position might not directly map to the canvas position,
        so we provide x/y coordinates the the item's render method.

        TODO alternatively, we could just transform the context, and the
             item would just draw whereever the context currently is.
      */
      var x = (item[0] - viewX) * tileWidth;
      var y = (item[1] - viewY) * tileHeight;
      var obj = item[4];

      if (obj.render) {
        obj.render.call(obj, ctx, x, y, tileWidth, tileHeight);
      }
    }
  }
};


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
    loadWorld('foo6.json', sceneManager),
    loadWorld('other1.json', sceneManager),
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
