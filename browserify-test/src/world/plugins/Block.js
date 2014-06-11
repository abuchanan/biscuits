import {Inject} from 'di';
import {BlockBody} from 'src/world';
import {factory} from 'src/utils';
import {SceneScope} from 'src/scene';

export {BlockLoader};

@SceneScope
@Inject(factory(BlockBody))
function BlockLoader(BlockBody) {
  return function(def, obj) {
    obj.body = new BlockBody(def.x, def.y, def.w, def.h);
  }
}
