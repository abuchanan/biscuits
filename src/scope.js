define(['lib/EventEmitter'], function(EventEmitter) {

    var currentScopeID = 1;

    function ScopeEvents(s) {
        var events = new EventEmitter();
        s.on = events.on.bind(events);
        s.off = events.off.bind(events);

        s.trigger = function() {
            events.trigger.apply(events, arguments);
            for (var i = 0; i < s.__children.length; i++) {
                s.__children[i].trigger.apply(s.__children[i], arguments);
            }
        }
    }


    // TODO this really conflicts with the rest of the code because it depends
    //      on "this". Could bind all these methods, or make them functions that
    //      require a base scope as the first arg, or sacrifice memory and define
    //      the functions inside Scope...
    var base = {

        __markedForDestruction: [],

        // Cleaning up destroyed objects requires an explicit pass.
        // (Hopefully) this makes it clear, obvious, and easy to understand
        // exactly when an object will be removed from the tree.
        //
        // For example, consider the case where you destroy a squirrel object.
        // The "tick" event is triggered, the squirrel object sees it was hit
        // and destroys itself. If you remove it from __children immediately,
        // then anything currently looping over __children is broken (e.g.
        // ScopeEvents.trigger).
        //
        // Or, consider the case where an object destroys another object.
        // Does the destroyed object get a "tick" event?
        //
        // By making cleanup an explicit pass that happens after the scene
        // "tick", these troublesome cases go away.
        clean: function() {
            for (var i = 0, ii = this.__markedForDestruction.length; i < ii; i++) {
                var obj = this.__markedForDestruction[i];

                obj.trigger('destroy');

                if (obj.__parent) {
                    var idx = obj.__parent.__children.indexOf(obj);
                    if (idx !== -1) {
                        obj.__parent.__children.splice(idx, 1);
                    }
                }
            }

            this.__markedForDestruction.length = 0;
        },

        // TODO don't allow destroy multiple times?
        destroy: function() {
            this.__markedForDestruction.push(this);
        },

        create: function() {
            var childScope = Scope(this);
            childScope.mixin.apply(childScope, arguments);
            return childScope;
        },

        mixin: function() {
            var args = [this];
            var rest = Array.prototype.slice.call(arguments, 1);
            Array.prototype.push.apply(args, rest);
            arguments[0].apply(this, args);
        },
    };


    function Scope(parent) {

        parent = parent || base;

        var scope = Object.create(parent);
        scope.__children = [];
        ScopeEvents(scope);
        scope.ID = currentScopeID++;

        if (parent !== base) {
            parent.__children.push(scope);
            scope.__parent = parent;
        }

        return scope;
    }

    return Scope;
});
