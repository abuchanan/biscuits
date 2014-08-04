import {Provide} from 'di';
import {Loadpoints} from 'src/loadpoints';
import {WorldSceneLoader} from 'src/worldscene';

export {
  MockLoadpoints,
  mockLoadpointsData
};


// TODO mock world for debugging only
@Provide(Loadpoints)
class MockLoadpoints {

  constructor() {
    this.loadpoints = {};
  }

  get(ID) {
    return this.loadpoints[ID];
  }

  addWorldScene(ID, mapPath, playerConfig) {
    this.loadpoints[ID] = {mapID: mapPath, loader: WorldSceneLoader, playerConfig};
  }
}

function mockLoadpointsData(loadpoints: Loadpoints) {
  // TODO important to note that player position is in pixels, not tiles
  loadpoints.addWorldScene('default', 'maps/door_use_switch_1.json', {x: 224, y: 224});
}
