define(function() {

    function Grid(world) {
        var worldRect = world.getRectangle();
        var grid = new Uint8Array(worldRect.w * worldRect.h);

        function updateGrid(rect, val) {

            for (var j = 0, jj = rect.h; j < jj; j++) {
              for (var i = 0, ii = rect.w; i < ii; i++) {

                var x = (rect.x + i) - worldRect.x;
                var y = (rect.y + j) - worldRect.y;

                var idx = (y * worldRect.h) + x;

                grid[idx] += val;
              }
            }
        }

        // TODO body.isBlock can change, which doesn't update here
        world.events.on('add', function(body) {
            if (body.isBlock) {
                updateGrid(body.getRectangle(), 1);
            }
        });

        world.events.on('remove', function(body) {
            if (body.isBlock) {
                updateGrid(body.getRectangle(), -1);
            }
        });

        function get(x, y) {
            var idx = (y * worldRect.h) + x;
            if (idx < 0 || idx > grid.length) {
                return;
            }
            return grid[idx];
        }

        function size() {
            return grid.length;
        }

        return {
            get: get,
            size: size,
        };
    }

    return Grid;
});
