function ChestService(player, world, container) {
  return {
    create: function(x, y, w, h) {

      var g = new PIXI.Graphics();
      g.beginFill(0x00FFFF);
      g.drawRect(0, 0, w, h);
      g.endFill();

      g.position.x = x;
      g.position.y = y;

      var isOpen = false;

      var chest = {
        chest: true,
        useable: true,
        use: function() {
          if (!isOpen) {
            isOpen = true;

            g.clear();
            g.beginFill(0x0000FF);
            g.drawRect(0, 0, w, h);
            g.endFill();

            player.coins += 5;
          }
        },
      };

      world.addStatic(chest, x, y, w, h);
      container.addChild(g);

      return chest;
    }
  }
}
