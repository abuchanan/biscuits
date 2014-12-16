
    function PlayerLife(s) {

        var life = 100;

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
