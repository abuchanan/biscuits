define(function() {

    function PlayerLife(body) {

        var life = 100;

        body.events.on('hit', function() {
            // TODO variable hit amounts
            life -= 10;

            if (life <= 0) {
                console.log('player dead');
            } else {
                console.log('player hit!', life);
            }
        });
    }


    return PlayerLife;

});
