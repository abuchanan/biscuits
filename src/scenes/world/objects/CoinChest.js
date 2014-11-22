define(['./Chest'], function(Chest) {

    function CoinChest(s, obj) {
        var chest = s.create(Chest, obj);
        var value = parseInt(obj.coinValue) || 1;

        chest.on('chest opened', function() {
            // TODO don't use global player
            s.player.coins.deposit(value);
        });
    }

    return CoinChest;
});
