define(['lib/EventEmitter'], function(EventEmitter) {

    function SquirrelPathDriver(scene, body, actions) {

        var path;
        var events = new EventEmitter();

        function setDestination(dest) {
            path = scene.findPath(body.getRectangle(), dest);
        }

        function update() {
            if (path && path.length > 0) {
                var action = actions.moveManager.getCurrentAction();

                if (!action) {
                    // TODO should pathfinder just return an array of deltas?
                    //      instead of an array of positions?
                    var pos = body.getPosition();
                    var next = path.shift();
                    var dx = next.x - pos.x;
                    var dy = next.y - pos.y;

                    if (dy == -1) {
                      actions.moveManager.start(actions.walk.north);
                    } else if (dy == 1) {
                      actions.moveManager.start(actions.walk.south);
                    } else if (dx == -1) {
                      actions.moveManager.start(actions.walk.west);
                    } else if (dx == 1) {
                      actions.moveManager.start(actions.walk.east);
                    }
                }
            } else {
                events.trigger('done');
            }
        }

        // Need a better way to listen for events that doesn't leak
        // memory when you forget to remove the handlers
        scene.events.on('tick', update);

        function destroy() {
            scene.events.off('tick', update);
        }

        return {
            setDestination: setDestination,
            events: events,
            destroy: destroy,
        };
    }


     // TODO sporadic animation. a squirrel isn't a fluid animation loop.
    function SquirrelSporadicDriver(scene, body, actions) {

        var driver = SquirrelPathDriver(scene, body, actions);

        function randomDestination() {
            var radius = 5;
            var bb = body.getRectangle();

            return {
                x: bb.x + Math.floor(Math.random() * radius * 2) - radius,
                y: bb.y + Math.floor(Math.random() * radius * 2) - radius,
            };
        }

        driver.events.on('done', function() {
            if (Math.random() < 0.25) {
              var dest = randomDestination();
              driver.setDestination(dest);
            } else {
              actions.moveManager.start(actions.stay);
            }
            
        });

        function destroy() {
            driver.destroy();
        }

        return {
            destroy: destroy,
        };
    }


    return SquirrelSporadicDriver;
});



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
