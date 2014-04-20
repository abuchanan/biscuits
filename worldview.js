
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

  items: function() {
    var viewX = this.position.getX();
    var viewY = this.position.getY();
    return this.world.query(viewX, viewY,
                            viewX + this.width - 1, viewY + this.height - 1);
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
      var obj = item[2];

      if (obj.render) {
        obj.render.call(obj, ctx, x, y, tileWidth, tileHeight);
      }
    }
  }
};

