import {Provide, SuperConstructor} from 'di';
import {Types} from 'src/worldscene';
import {Loader} from 'src/utils';
import {Body} from 'src/world';
import {ObjectScope} from 'src/scope';
import {Renderer} from 'src/render';
import {ObjectConfig} from 'src/config';
import {Scene, SceneObject} from 'src/scene';

export {
  SwitchedDoorLoader,
  DoorSwitchLoader,
  UseableDoorSwitchLoader,
};


@ObjectScope
@Provide(Body)
class SwitchedDoorBody extends Body {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this.isBlock = true;
  }
}


@ObjectScope
function SwitchedDoorRenderer(renderer: Renderer, body: Body) {
  var layer = renderer.getLayer('objects');
  var rect = body.getRectangle();

  var g = renderer.createGraphic();
  g.beginFill(0xD10000);
  g.drawRect(rect.x, rect.y, rect.w, rect.h);
  g.endFill();
  layer.addChild(g);

  return {
    show: function() {
      layer.addChild(g);
    },
    hide: function() {
      layer.removeChild(g);
    }
  }
}


@ObjectScope
@Provide(SceneObject)
class SwitchedDoor extends SceneObject {

  // TODO can't inject Body here because it creates a circular dependency,
  //      Body -> SceneObject -> Body.
  //      Body and World need to be rethought, refactored. Maybe a Body
  //      shouldn't be adding itself to the World? For now I'm working
  //      around this using `this.get(Body)`
  //
  //      Turns out I can't inject SwitchedDoorRenderer for the same reason
  //      so it's pretty bad to have Body depend on SceneObject
  //      SceneObjects need to have Bodies and SceneObjects need to be
  //      added to a World outside of the Body constructor.
  //constructor(superConstructor: SuperConstructor,
  //            body: Body,
  //            renderer: SwitchedDoorRenderer) {

  constructor(superConstructor: SuperConstructor) {
    superConstructor();
    this._locks = {};
  }

  unlock(ID) {
    delete this._locks[ID];

    if (Object.keys(this._locks).length == 0) {
      this.get(Body).isBlock = false;
      this.get(SwitchedDoorRenderer).hide();
    }
  }

  lock(ID) {
    console.log('lock', ID);
    this._locks[ID] = true;
    this.get(Body).isBlock = true;
    this.get(SwitchedDoorRenderer).show();
  }
}


@ObjectScope
function Collision(body: Body, config: ObjectConfig, object: SceneObject, scene: Scene) {

  scene.events.on('loaded', function() {
    scene.getObject(config.target).lock(object.ID);
  });

  body.events.on('player collision', function() {
    scene.getObject(config.target).unlock(object.ID);
  });
}


@ObjectScope
function Useable(body: Body, config: ObjectConfig, object: SceneObject, scene: Scene) {

  scene.events.on('loaded', function() {
    scene.getObject(config.target).lock(object.ID);
  });

  body.events.on('use', function() {
    scene.getObject(config.target).unlock(object.ID);
  });
}


Types['switched-door'] = Loader()
  .provides(SwitchedDoorBody, SwitchedDoor)
  .runs(Body, SwitchedDoorRenderer);

Types['door-switch'] = Loader().runs(Collision);

Types['useable-door-switch'] = Loader().runs(Useable);
