import {Provide} from 'di';
import {Loadpoints} from 'src/loadpoints';
import {WorldSceneLoader} from 'src/worldscene';

export {MockLoadpoints};


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
  loadpoints.addWorldScene('default', 'maps/foo10.json');
}
