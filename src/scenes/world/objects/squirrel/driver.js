define(function() {

    function SquirrelPathDriver(s, actions) {

        var path;
        var body = s.body;

        s.setDestination = function(dest) {
            path = s.world.findPath(body.getRectangle(), dest);
        }

        s.on('tick', function() {
            if (path && path.length > 0) {
                var action = actions.moveManager.getCurrentAction();

                if (!action) {
                    // TODO should pathfinder just return an array of deltas?
                    //      instead of an array of positions?
                    var pos = body.getPosition();
                    var next = path.shift();
                    var dx = next.x - pos.x;
                    var dy = next.y - pos.y;

                    if (dy == -1) {
                      actions.moveManager.start(actions.walk.north);
                    } else if (dy == 1) {
                      actions.moveManager.start(actions.walk.south);
                    } else if (dx == -1) {
                      actions.moveManager.start(actions.walk.west);
                    } else if (dx == 1) {
                      actions.moveManager.start(actions.walk.east);
                    }
                }
            } else {
                s.trigger('Reached destination');
            }
        });
    }

    return SquirrelSporadicDriver;
});
