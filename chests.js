function ChestService(player, world, container) {
  // TODO separate chest renderable from chest service?
  return {
    create: function(x, y, w, h) {

      var g = new PIXI.Graphics();
      g.beginFill(0x00FFFF);
      g.drawRect(x, y, w, h);
      g.endFill();
      container.addChild(g);

      var isOpen = false;

      var chest = {
        chest: true,
        useable: true,
        use: function() {
          if (!isOpen) {
            isOpen = true;

            g.clear();
            g.beginFill(0x0000FF);
            g.drawRect(x, y, w, h);
            g.endFill();

            player.coins += 5;
          }
        },
      };

      // TODO need better way to add data to a world object?
      var worldObj = world.add(x, y, w, h);
      worldObj.isBlock = true;
      worldObj.data = chest;
      return chest;
    }
  }
}
