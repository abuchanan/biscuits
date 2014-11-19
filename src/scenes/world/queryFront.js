
  function queryFront(world, body, distance = 1) {
    // TODO(abuchanan) optimize
    var rect = body.getRectangle();

    switch (body.direction) {
      case 'up':
        var x1 = rect.x;
        var y1 = rect.y - distance;
        var w1 = rect.w;
        var h1 = distance;
        break;

      case 'down':
        var x1 = rect.x;
        var y1 = rect.y + rect.h;
        var w1 = rect.w;
        var h1 = distance;
        break;

      case 'left':
        var x1 = rect.x - distance;
        var y1 = rect.y;
        var w1 = distance;
        var h1 = rect.h;
        break;

      case 'right':
        var x1 = rect.x + rect.w;
        var y1 = rect.y;
        var w1 = distance;
        var h1 = rect.h;
        break;
    }
    return world.query(x1, y1, w1, h1);
  }
