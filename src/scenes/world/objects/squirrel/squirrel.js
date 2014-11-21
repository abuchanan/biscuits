define([
    './renderer',
    './actions',
    './driver',
    '../../Body'

], function(SquirrelRenderer, SquirrelActions, SquirrelDriver, Body) {


    function SquirrelPlugin(s) {
        var map = s.map;
        var tileWidth = s.map.mapData.tilewidth;
        var tileHeight = s.map.mapData.tileheight;

        for (var i = 0, ii = map.objectlayers.length; i < ii; i++) {
            var layer = map.objectlayers[i];
            for (var j = 0, jj = layer.length; j < jj; j++) {
                var obj = layer[j];

                if (obj.hasType('Squirrel')) {
                    var x = obj.x / tileWidth;
                    var y = obj.y / tileHeight;
                    var w = obj.w / tileWidth;
                    var h = obj.h / tileHeight;

                    s.create(Squirrel, x, y, w, h);
                }
            }
        }
    }


    function Squirrel(s, x, y, w, h) {

        s.body = s.create(Body, x, y, w, h, false);

        s.actions = s.create(SquirrelActions);
        s.create(SquirrelRenderer, s.actions.moveManager);
        var driver = s.create(SquirrelDriver, s.actions);

        var life = 20;

        s.body.on('hit', function() {
          life -= 10;

          if (life <= 0) {
              console.log('dead');
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

    return SquirrelPlugin;
});



// TODO gosh it would be nice not to have to prefix everything with "Squirrel"
