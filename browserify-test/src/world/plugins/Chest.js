module ObjectLoader from 'src/ObjectLoader';

ObjectLoader.events.on('load chest', function(def, obj, scene) {

    // TODO contain things other than coins
    var value = def.coinValue || 1;

    /*
    var g = new PIXI.Graphics();
    g.beginFill(0x00FFFF);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);
    */

    var body = scene.world.add(def.x, def.y, def.w, def.h);
    body.isBlock = true;
    var isOpen = false;

    // TODO or obj.events?
    // TODO obj and body should probably be the same object
    body.events.on('use', function(player) {
      if (!isOpen) {
        isOpen = true;
        player.coins.deposit(value);

        /*
        g.clear();
        g.beginFill(0x0000FF);
        g.drawRect(x, y, w, h);
        g.endFill();
        */
      }
    });
});
