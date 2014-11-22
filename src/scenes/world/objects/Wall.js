define(['../Body'], function(Body) {

    function Wall(s, obj) {
       s.create(Body, obj.x, obj.y, obj.w, obj.h, true);
    }

    return Wall;
});
