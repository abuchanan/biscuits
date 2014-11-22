define(['lib/pixi'], function(PIXI) {
  
    function HUDPlugin(s) {
        var layer = s.renderer.getLayer('hud');

        var healthText = new PIXI.Text('Health: ' + 0, {fill: 'white'});
        layer.addChild(healthText);

        var coinText = new PIXI.Text('Coins: ' + 0, {fill: 'white'});
        coinText.y = 25;
        layer.addChild(coinText);

        s.on('tick', function() {
            healthText.setText('Health: ' + s.player.life.get(), {fill: 'white'});
            coinText.setText('Coins: ' + s.player.coins.balance(), {fill: 'white'});
        });
    }

    return HUDPlugin;
});
