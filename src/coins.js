// TODO can I used dependency injection to nicely get ahold of things like
//      world and container instances that are specific to the scene?
//      do i need that? it's not that bad just passing them in?
//
//      it might be useful for managing start/stop lifecycle of dependencies
//      keybindings is a good example: multiple scene services use keybindings
//      so when they start/stop, they have to remember to deregister their
//      keybindings. if instead the keybindings injectable was sensitive to
//      its context, that it's scene specific, the scene could control
//      stopping all services. there is complexity in managing services
//      and it's probably easy to mess up. for example, services load
//      asychronously, so they must be waited for. what if you forget that?
//      what if you forget to stop a service, such as keybindings? you'll
//      get subtle, probably invisible bugs. very bad
//
//      would these special, current-scene injectables only be available
//      to world loader plugins? seems like you'd want to only make them
//      available to things that definitely have a single, obvious scene.
//      wouldn't want some module using a current-scene dependency across
//      multiple scenes.
//
//      game pause is another pretty good example of why this could be
//      a good pattern: when the player pauses, the scene isn't necessarily
//      unloaded, just all the services need to be stopped.
//
//      CurrentScene!foo is really only specific to a certain type of scene
//      though. 
//
// define('WorldLoaderPlugin!coin', ['CurrentScene!world', 'CurrentScene!player'],
//   function(world, player) { ...etc...});

// OR WorldLoaderPlugin('coin', function() {})

define('world/plugins/coin', function() {

  function create(obj, world, container) {
    var x = obj.x;
    var y = obj.y;
    var w = obj.w;
    var h = obj.h;
    var value = obj.coinValue || 1;

    var g = new PIXI.Graphics();
    g.beginFill(0xF0F074);
    g.drawRect(x, y, w, h);
    g.endFill();
    container.addChild(g);

    var worldObj = world.add(x, y, w, h);

    worldObj.on('player collision', function(player) {
      worldObj.remove();
      // TODO maybe player.addCoins would be better
      player.coins += value;
      container.removeChild(g);
    });
  }

  return {
    enable: function() {},
    disable: function() {},
    create: create,
  };
});
