// TODO can get around needing pass in world?
export function BlockableMovement(body, world) {
  var origSetPosition = body.setPosition;

  body.setPosition = function(x, y) {
      // TODO extract to world.containsBlock()?
      var rect = body.getRectangle();
      var objs = world.query(x, y, rect.w, rect.h);

      // Check if the next tile is blocked.
      var blocked = false;
      for (var i = 0, ii = objs.length; i < ii; i++) {
        if (objs[i] !== body && objs[i].isBlock) {
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        origSetPosition.call(body, x, y);
      }
  };

  return body;
}
