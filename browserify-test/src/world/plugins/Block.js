import {InjectLazy} from 'di';
import {Body} from 'src/world';
import {SceneScope} from 'src/scene';

export {BlockLoader};

@SceneScope
@InjectLazy(Body)
function BlockLoader(createBody) {
  return function(def, obj) {
    var bodyConfig = {
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      obj: obj,
      isBlock: true,
    };

    obj.body = createBody('body-config', bodyConfig);
  }
}
