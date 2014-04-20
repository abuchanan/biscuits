
/*
var wallBody = world.CreateBody( new Box2D.b2BodyDef() );
var wallShape = new Box2D.b2EdgeShape();
wallShape.Set(new Box2D.b2Vec2(0.0, 0.0), new Box2D.b2Vec2(40.0, 0.0));
wallBody.CreateFixture(wallShape, 0.0);
*/


function World() {
  var gravity = new Box2D.b2Vec2(0.0, 0.0);
  var world = new Box2D.b2World(gravity);

  var simulateIntervalId;

  var myQueryCallback = new Box2D.b2QueryCallback();

  Box2D.customizeVTable(myQueryCallback, [{
      original: Box2D.b2QueryCallback.prototype.ReportFixture,
      replacement:
          function(thsPtr, fixturePtr) {
              var ths = Box2D.wrapPointer(thsPtr, Box2D.b2QueryCallback);
              var fixture = Box2D.wrapPointer(fixturePtr, Box2D.b2Fixture);
              var pos = fixture.GetBody().GetPosition();

              ths.items.push([
                pos.get_x(),
                pos.get_y(),
                fixture.objectData,
              ]);

              return true;
              // at this point we know the mouse is inside the AABB of this fixture,
              // but we need to check if it's actually inside the fixture as well
              /*
              if ( ! fixture.TestPoint( ths.m_point ) ) {
                  return true;
              }

              ths.m_fixture = fixture;
              return false;
              */
          }
  }]);

  return {

    add: function(data, x, y) {
        console.log('add', data);

      var bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_type(Box2D.b2_dynamicBody);
      bodyDef.set_position(new Box2D.b2Vec2(x, y));
      var body = world.CreateBody(bodyDef);
      body.SetLinearDamping(0.05);

      var shape = new Box2D.b2PolygonShape();
      shape.SetAsBox(1.0, 1.0);
      var fixture = body.CreateFixture(shape, 80);

      fixture.objectData = data;

      return body;
    },

    start: function() {
      simulateIntervalId = setInterval(function() {
        world.Step(15, 2, 2);
      }, 15);
    },

    stop: function() {
      if (simulateIntervalId) {
        clearInterval(simulateIntervalId);
        simulateIntervalId = false;
      }
    },

    query: function(x1, y1, x2, y2) {
      myQueryCallback.items = []

      // the AABB is a tiny square around the current mouse position
      var aabb = new Box2D.b2AABB();
      aabb.set_lowerBound(new Box2D.b2Vec2(x1, y1));
      aabb.set_upperBound(new Box2D.b2Vec2(x2, y2));
      world.QueryAABB( myQueryCallback, aabb );

      return myQueryCallback.items;
    },

  }
}
