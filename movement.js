
function MovementHandler(keybindings, player, view, viewpointLoader) {

  function move(rowDelta, columnDelta) {

    var nextRow = player.position.row + rowDelta;
    var nextCol = player.position.column + columnDelta;

    var nextTile = view.getTile(nextRow, nextCol);

    if (nextTile && !nextTile.block) {

      if (nextTile.portal) {
        viewpointLoader.load(nextTile.portal);

      } else if (nextTile.column == view.position.column + view.numColumns - 1) {
        player.position.column = 1;
        view.shiftRight();

      } else if (nextTile.column == view.position.column) {
        view.shiftLeft();
        player.position.column = view.numColumns - 2;

      } else if (nextTile.row == view.position.row + view.numRows - 1) {
        view.shiftDown();
        player.position.row = 1;

      } else if (nextTile.row == view.position.row) {
        view.shiftUp();
        player.position.row = view.numRows - 2;

      } else {
        player.position.row = nextRow;
        player.position.column = nextCol;
      }
      
    }
  }

  function makeCallback(rowDelta, columnDelta) {
    return function(direction) {
      move(rowDelta, columnDelta);
      player.direction = direction;
    }
  }

  keybindings.on('up', makeCallback(-1, 0));
  keybindings.on('down', makeCallback(1, 0));
  keybindings.on('left', makeCallback(0, -1));
  keybindings.on('right', makeCallback(0, 1));
}
