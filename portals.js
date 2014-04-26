
function PortalService(player, world, sceneManager, container) {

  // Portal handling
  // TODO player jumps through portal with the slightest overlap.
  //      would be nicer to wait until the player is overlapping more
  //      so it feels like you're *in* the portal
  world.contactListener(player, function(fixture) {
    var data = fixture.objectData;
    if (data.isPortal) {
      data.loadDestination.call(data);
    }
  });

  return {
    create: function(dest, x, y, w, h) {

        var g = new PIXI.Graphics();
        g.beginFill(0x00ffaa);
        g.drawRect(0, 0, w, h);
        g.endFill();

        g.position.x = x - (w / 2);
        g.position.y = y - (h / 2);

        var portal = {
          destination: dest,
          isPortal: true,
          loadDestination: function() {
            sceneManager.load(this.destination);
          },
        };

        world.addBox(x, y, w, h, portal, {sensor: true});
        container.addChild(g);

        return portal;
    },
  }
}
