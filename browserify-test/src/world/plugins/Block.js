module ObjectLoader from 'src/ObjectLoader';

ObjectLoader.events.on('load block', function(def, obj, scene) {
    var body = scene.world.add(def.x, def.y, def.w, def.h);
    // TODO should isBlock be on the worldObj or the world body?
    //      maybe they should both be the same object?
    //      world queries will return bodies, so how do you connect those
    //      back to world objects?
    body.isBlock = true;
});

