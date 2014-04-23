
function World(scale) {
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

  var listener = new Box2D.b2ContactListener();
  var contactCallbacks = [];

  Box2D.customizeVTable(listener, [{
      original: Box2D.b2ContactListener.prototype.BeginContact,
      replacement:
          function (thsPtr, contactPtr) {
              var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
              var fixtureA = contact.GetFixtureA();
              var fixtureB = contact.GetFixtureB();

              for (var i = 0; i < contactCallbacks.length; i++) {
                contactCallbacks[i](fixtureA, fixtureB);
              }
          }
  }]);

  world.SetContactListener(listener);

  var scheduledUpdates = [];

  return {

    // TODO need to figure out how to encapsulate the Box2D API
    //      while still provide what the outside code needs without
    //      having a messy API

    addEdge: function(data, x1, y1, x2, y2) {
      x1 = x1 / scale;
      y1 = y1 / scale;
      x2 = x2 / scale;
      y2 = y2 / scale;

      var bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_position(new Box2D.b2Vec2(x1, y1));
      var body = world.CreateBody(bodyDef);

      var shape = new Box2D.b2EdgeShape();
      shape.Set(new Box2D.b2Vec2(0, 0), new Box2D.b2Vec2(x2 - x1, y2 - y1));

      var fixture = body.CreateFixture(shape, 0);
      fixture.objectData = data;
      return fixture;
    },

    addEdgeSensor: function(data, x1, y1, x2, y2) {
      var fixture = this.addEdge(data, x1, y1, x2, y2);
      fixture.SetSensor(true);
      return fixture;
    },

    addDynamic: function(data, x, y, w, h) {
      x = x / scale;
      y = y / scale;
      w = w / scale || 1.0;
      h = h / scale || 1.0;

      var bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_type(Box2D.b2_dynamicBody);
      bodyDef.set_position(new Box2D.b2Vec2(x + w / 2, y + h / 2));
      var body = world.CreateBody(bodyDef);

      var shape = new Box2D.b2PolygonShape();
      shape.SetAsBox(w / 2, h / 2);
      var fixture = body.CreateFixture(shape, 80);

      fixture.objectData = data;

      return fixture;
    },

    addStatic: function(data, x, y, w, h) {
      x = x / scale;
      y = y / scale;
      w = w / scale || 1.0;
      h = h / scale || 1.0;

      var bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_position(new Box2D.b2Vec2(x + (w / 2), y + (h / 2)));
      var body = world.CreateBody(bodyDef);

      var shape = new Box2D.b2PolygonShape();
      shape.SetAsBox(w / 2, h / 2);
      var fixture = body.CreateFixture(shape, 0);

      fixture.objectData = data;

      return fixture;
    },

    addSensor: function(data, x, y, w, h) {
      var fixture = this.addStatic(data, x, y, w, h);
      fixture.SetSensor(true);
      return fixture;
    },

    start: function() {
      simulateIntervalId = setInterval(function() {
        world.Step(0.15, 8, 2);

        while (scheduledUpdates.length > 0) {
          var func = scheduledUpdates.pop();
          func();
        }
      }, 15);
    },

    stop: function() {
      if (simulateIntervalId) {
        clearInterval(simulateIntervalId);
        simulateIntervalId = false;
      }
    },

    scheduleUpdate: function(func) {
      scheduledUpdates.push(func);
    },

    contactListener: function(callback) {
      contactCallbacks.push(callback);
    },

    remove: function(fixture) {
      world.DestroyBody(fixture.GetBody());
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
