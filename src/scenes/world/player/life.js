define(['lib/EventEmitter'], function(EventEmitter) {

    function PlayerLife(s) {

        var life = 100;
        var events = new EventEmitter();

        s.body.on('hit', function() {
            // TODO variable hit amounts
            life -= 10;

            if (life <= 0) {
                console.log('player dead');
                s.start('dead');
            } else {
                console.log('player hit!', life);
            }
        });

        s.get = function() {
          return life;
        };
    }


    return PlayerLife;

});
