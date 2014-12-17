
    function Squirrel(s, obj) {

        var driver = s.create(SquirrelDriver, s.actions);

        // TODO happens when player moves and collides with object,
        //      but should probably happen the other way around too;
        //      object moves and collides with player
        //
        //body.events.on('player collision', function() {
         // actions.hitManager.start(actions.hitPlayer);
        //});

        s.on('tick', function() {
            // TODO need a more simple way of responding to collisions
            var bb = s.body.getRectangle();
            var hits = s.world.query(bb);
            var hitPlayer = false;

            for (var i = 0, ii = hits.length; i < ii; i++) {
                if (hits[i] === s.player.body) {
                    hitPlayer = true;
                }
            }

            if (hitPlayer) {
                s.actions.hitManager.start(s.actions.hitPlayer);
            } else {
                s.actions.hitManager.stopAll();
            }
        });
    }
