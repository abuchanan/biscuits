
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
                var match = contactCallbacks[i][0];
                if (fixtureA.objectData === match) {
                  contactCallbacks[i][1](fixtureB);
                }
                else if (fixtureB.objectData === match) {
                  contactCallbacks[i][1](fixtureA);
                }
              }
          }
  }]);

  world.SetContactListener(listener);

  var scheduledUpdates = [];


  var raycastCallback = new Box2D.b2RayCastCallback();

  Box2D.customizeVTable(raycastCallback, [{
    original: Box2D.b2RayCastCallback.prototype.ReportFixture,
    replacement: function(thsPtr, fixturePtr, point, normal, fraction) {
      var ths = Box2D.wrapPointer(thsPtr, Box2D.b2RayCastCallback);
      var fixture = Box2D.wrapPointer(fixturePtr, Box2D.b2Fixture);

      ths.items.push([fixture, point, normal, fraction]);

      // TODO this needs to be improved. the external code should be
      //      able to control the returned fraction
      return 1;

      //return fraction;
    },
  }]);


  var stepCallbacks = [];

  var defaultMass = 80;
  var defaultLinearDamping = 0.0;

  return {

    // TODO need to figure out how to encapsulate the Box2D API
    //      while still provide what the outside code needs without
    //      having a messy API

    addEdge: function(x1, y1, x2, y2, data, options) {

      var p1 = new Box2D.b2Vec2(0, 0);
      var p2 = new Box2D.b2Vec2((x2 / scale) - (x1 / scale),
                                (y2 / scale) - (y1 / scale));

      var shape = new Box2D.b2EdgeShape();
      shape.Set(p1, p2);

      return this.add(x1, y1, shape, data, options);
    },

    addBox: function(x, y, w, h, data, options) {

      w = w / scale || 1.0;
      h = h / scale || 1.0;

      var shape = new Box2D.b2PolygonShape();
      shape.SetAsBox(w / 2, h / 2);

      return this.add(x, y, shape, data, options);
    },

    add: function(x, y, shape, data, options) {

      x = x / scale;
      y = y / scale;

      data = data || {};
      options = options || {};

      var mass = options.mass || defaultMass;
      var sensor = options.sensor || false;
      var linearDamping = options.linearDamping || defaultLinearDamping;

      if (options.type == 'static') {
        var bodyType = Box2D.b2_staticBody;
      } else if (options.type == 'kinematic') {
        var bodyType = Box2D.b2_kinematicBody;
      } else {
        var bodyType = Box2D.b2_dynamicBody;
      }

      // TODO must it be static?
      if (sensor) {
        bodyType = Box2D.b2_staticBody;
      }

      var bodyDef = new Box2D.b2BodyDef();
      bodyDef.set_type(bodyType);
      bodyDef.set_position(new Box2D.b2Vec2(x, y));
      var body = world.CreateBody(bodyDef);
      body.SetLinearDamping(linearDamping);

      var fixture = body.CreateFixture(shape, mass);

      fixture.objectData = data;
      fixture.SetSensor(sensor);

      return fixture;
    },

    start: function() {
      simulateIntervalId = setInterval(function() {
        world.Step(0.15, 8, 2);

        for (var i = 0, ii = stepCallbacks.length; i < ii; i++) {
          stepCallbacks[i]();
        }

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

    onStep: function(callback) {
      stepCallbacks.push(callback);
    },

    scheduleUpdate: function(func) {
      scheduledUpdates.push(func);
    },

    contactListener: function(match, callback) {
      contactCallbacks.push([match, callback]);
    },

    remove: function(fixture) {
      this.scheduleUpdate(function() {
        world.DestroyBody(fixture.GetBody());
      });
    },

    raycast: function(x1, y1, x2, y2) {
      raycastCallback.items = [];
      var p1 = new Box2D.b2Vec2(x1 / scale, y1 / scale);
      var p2 = new Box2D.b2Vec2(x2 / scale, y2 / scale);
      world.RayCast(raycastCallback, p1, p2);
      return raycastCallback.items;
    },

    query: function(x1, y1, x2, y2) {
      x1 = x1 / scale;
      y1 = y1 / scale;
      x2 = x2 / scale;
      y2 = y2 / scale;
      
      myQueryCallback.items = []

      // the AABB is a tiny square around the current mouse position
      var aabb = new Box2D.b2AABB();
      aabb.set_lowerBound(new Box2D.b2Vec2(x1, y1));
      aabb.set_upperBound(new Box2D.b2Vec2(x2, y2));
      world.QueryAABB( myQueryCallback, aabb );

      return myQueryCallback.items;
    },

    scale: function(x) {
      return x / scale;
    },

    unscale: function(x) {
      return x * scale;
    },

  }
}
