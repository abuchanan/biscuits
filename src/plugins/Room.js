import {ObjectScope} from 'src/scope';
import {Types} from 'src/types';
import {Loader} from 'src/utils';
import {Region} from 'src/plugins/Region';

@ObjectScope
function setupRoom(region: Region) {
  region.active = false;
}


Types['room'] = new Loader().runs(setupRoom);
