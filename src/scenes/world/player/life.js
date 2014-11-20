define(['lib/EventEmitter'], function(EventEmitter) {

    function PlayerLife(scene, body) {

        var life = 100;
        var events = new EventEmitter();

        body.events.on('hit', function() {
            // TODO variable hit amounts
            life -= 10;

            if (life <= 0) {
                console.log('player dead');
                scene.start('dead');
            } else {
                console.log('player hit!', life);
            }
        });

        return {
            get: function() {
                return life;
            },
        }
    }


    return PlayerLife;

});
