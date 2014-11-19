import {Body} from 'src/world';
import {Scene} from 'src/scene';
import {ObjectScope} from 'src/scope';
import {ObjectConfig} from 'src/config';
import {Types} from 'src/types';
import {Loader} from 'src/utils';
import {Region} from 'src/plugins/Region';

@ObjectScope
class Room {
  constructor(region: Region) {
    this._region = region;
    region.enabled = false;
  }

  enable() {
    this._region.enabled = true;
  }
}


@ObjectScope
function Useable(body: Body, config: ObjectConfig, scene: Scene) {

  body.events.on('use', function() {
    console.log(config.target);
    console.log(scene);
    scene.getObject(config.target).get(Room).enable();
  });
}

Types['useable-room-enabler'] = new Loader().runs(Useable);

Types['room'] = new Loader().runs(Room);
