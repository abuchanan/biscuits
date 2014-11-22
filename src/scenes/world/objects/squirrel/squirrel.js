define([
    './renderer',
    './actions',
    './driver',
    '../../Body'

], function(SquirrelRenderer, SquirrelActions, SquirrelDriver, Body) {


    function Squirrel(s, obj) {

        s.body = s.create(Body, obj.x, obj.y, obj.w, obj.h, false);

        s.actions = s.create(SquirrelActions);
        s.create(SquirrelRenderer, s.actions.moveManager);
        var driver = s.create(SquirrelDriver, s.actions);

        var life = 20;

        s.body.on('hit', function() {
          life -= 10;

          if (life <= 0) {
              s.trigger('dead');
              s.destroy();
          } else {
              console.log('squirrel hit!', life);
          }
        });


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

    return Squirrel;
});



// TODO gosh it would be nice not to have to prefix everything with "Squirrel"
