import {Provide} from 'di';
import {Loadpoints} from 'src/loadpoints';
import {WorldSceneLoader} from 'src/worldscene';

export {MockLoadpoints};


// TODO mock world for debugging only
@Provide(Loadpoints)
class MockLoadpoints {
  get(ID) {
    return {mapID: 'foo10', loader: WorldSceneLoader};
  }
}
