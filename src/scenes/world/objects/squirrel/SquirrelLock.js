// TODO I don't like this way of implementing this. It's specific to squirrel
//      which means it's not pluggable. I envision a solution that uses a
//      graph editor to allow the designer to configure the squirrel node
//      of have a lock child, but that's too much work for right now.
define(['./Squirrel'], function(Squirrel) {

    function DestroyLock(s, obj) {

        s.objects[obj.lockTarget].lock(obj.name);

        s.on('dead', function() {
            s.objects[obj.lockTarget].unlock(obj.name);
        });
    }

    function SquirrelLock(s, obj) {
        var squirrel = s.create(Squirrel, obj);
        squirrel.create(DestroyLock, obj);
    }

    return SquirrelLock;
});
