define(function() {

    function SquirrelDriver(scene, body, actions) {
        var path;

        function onLoad() {
            path = scene.findPath({x: 32, y: 43}, {x: 23, y: 27});
        }

        function update() {
            if (path && path.length > 0) {
                var action = actions.moveManager.getCurrentAction();

                if (!action) {
                    var pos = body.getPosition();
                    var next = path.shift();
                    var dx = next.x - pos.x;
                    var dy = next.y - pos.y;

                    if (dy == -1) {
                      actions.moveManager.start(actions.walk.up);
                    } else if (dy == 1) {
                      actions.moveManager.start(actions.walk.down);
                    } else if (dx == -1) {
                      actions.moveManager.start(actions.walk.left);
                    } else if (dx == 1) {
                      actions.moveManager.start(actions.walk.right);
                    }
                }
            }
        }

        // Need a better way to listen for events that doesn't leak
        // memory when you forget to remove the handlers
        scene.events.on('loaded', onLoad);
        scene.events.on('tick', update);

        function destroy() {
            scene.events.off('loaded', onLoad);
            scene.events.off('tick', update);
        }

        return {
            destroy: destroy,
        };
    }

    return SquirrelDriver;
});
// TODO sporadic animation. a squirrel isn't a fluid animation loop.


/*
function SquirrelDriver(scene: Scene, actions: SquirrelActions) {

    // TODO I think that simplicity in destroying an object is really interesting,
    //      particularly when it comes to callback functions like this. Currently,
    //      an object needs to register a callback function. If the squirrel was
    //      destroyed by some other plugin/method, it would need to signal this
    //      plugin to deregister itself. If you forgot to code deregister everything
    //      correctly (arguably, easy to do!) bad, things could happen (very subtly).
    //      It'd be better if nothing held onto any part of the destroyable object.
    //      When the object is gone, all its ties are gone automatically.
    //
    //      For this app, possibly this could come in the form of an Update() method,
    //      which can be returned by any plugin. The SceneManager can look for these
    //      hooks.
    //
    //      Or, if every object gets an injector, then every object can get an 
    //      object-specific events bus. When the object tells the Scene that it wants
    //      to destroy itself, the events bus will go with it. This could also have
    //      a nice effect on the input event api.
    //
    //      On the other hand, it's difficult to magically remove a body from the world
    //      when the object is destroyed. That feels like something the absolutely 
    //      requires a "destory" hook, although this could be built into Body so that
    //      everyone gets it for free.
    //
    //      Could also consider using something like WeakMap to track event listeners?
    //      Won't have reasonable browser support for a long time though.
    var noop = function() {};
    var choices = [
      actions.walkUp,
      actions.walkDown,
      actions.walkLeft,
      actions.walkRight,
    ];

    scene.events.on('tick', function() {
      var state = actions.manager.getState();

      if (state.action == 'stop') {
        if (Math.random() > 0.95) {
          var i = Math.floor(Math.random() * choices.length);
          var move = choices[i];
          actions.manager.start(move);
        } else {
          actions.manager.stopAll();
        }
      } else {
        actions.manager.stopAll();
      }
    });
}

*/
