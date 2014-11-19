import {Injector, Provide} from 'di';
import {ObjectScope, SceneScope} from 'src/scope';
import {Scene, SceneObject} from 'src/scene';
import {ObjectConfig} from 'src/config';
import {Types} from 'src/types';
import {WorldMap} from 'src/worldmap';
import {Player} from 'src/plugins/Player';
import {BodyConfig, Body} from 'src/world';
import {BackgroundGrid} from 'src/background';
import {Loader} from 'src/utils';

export {ActiveRegion, Region};

// TODO how to handle hiding vs dimming?

/*
  TODO 
  need to:
  - be able to query all objects in a given rectangle
  - those objects should render appropriately

  questions:
  - need to ensure that all areas are covered by a region?
  - how to handle locked room?
  - maybe want containing layer, so that objects don't have to worry about rendering
    active/inactive styles are applied to the container.
*/


@SceneScope
class ObjectLoader {

  constructor(injector: Injector) {
    this._injector = injector;
  }

  load(config) {

    var loader = this._getLoader(config);

    // TODO this doesn't seem right
    var bodyConfig = new BodyConfig(config.x, config.y, config.w, config.h,
                                    config.isBlock || false);

    // TODO this seems broken. isn't this creating a separate injector for
    //   each loader? but one object and all its loaders should share the
    //   same scope and injector
    loader = loader
      .hasScope(ObjectScope)
      .binds(BodyConfig, bodyConfig, ObjectScope)
      .binds(ObjectConfig, config, ObjectScope);

    var objectInjector = this._injector.get(loader.Injector);
    objectInjector.get(SceneObject);
    return objectInjector;

    // TODO this should be able to return the loaded object
  }


  // TODO have a compile-time checker that ensures every object
  //      in a large map can be loaded properly
  _getLoader(config) {

    // TODO this is a mess. loaders have been a mess. combining them,
    //   especially here, is a mess
    var combinedLoader = new Loader();

    config.types.forEach((type) => {
      var loader = Types[type];

      // TODO maybe don't crash when an object is unrecognized
      //      just log a warning and skip it.
      if (!loader) {
        throw 'Unknown object type: ' + type;
      }

      combinedLoader = combinedLoader
        .provides(loader._providers)
        .runs(loader._deps)
        .hasScope(loader._scope);
    });

    return combinedLoader;
  }
}


/* How do you efficiently query the objects in a region with holes in it?
   Picture a map with a house in the middle. You don't want to activate the objects
   in the house. Do you query the objects in the greater region and then subtract
   the objects in the house?
*/


@SceneScope
class Regions {

  constructor(map: WorldMap) {
    this._map = map;
  }

  query(x, y, w, h) {
    var ret = [];
    var q = {
      x: x,
      y: y,
      w: w,
      h: h
    };

    var regions = this;

    // TODO in the future this won't have access to map, since map will be loaded
    //      in pieces
    this._map.objectlayers.forEach(function(layer) {
      layer.forEach(function(objectConfig) {
        if (objectConfig.hasType('region') && regions._inRegion(q, objectConfig)) {
          ret.push(objectConfig);
        }
      });
    });

    return ret;
  }

  _inRegion(region, item) {
    var iw = item.w || item.width;
    var ih = item.h || item.height;
    var ix1 = item.x;
    var iy1 = item.y;
    var ix2 = ix1 + iw;
    var iy2 = iy1 + ih;

    var rw = region.w;
    var rh = region.h;
    var rx1 = region.x;
    var ry1 = region.y;
    var rx2 = rx1 + rw;
    var ry2 = ry1 + rh;

    return ix2 >= rx1 && ix1 <= rx2 && iy2 >= ry1 && iy1 <= ry2;
  }

// Room plugin can use this to mask a region as inactive
  addMask() {
  }
}


@SceneScope
class RegionLoader {

  constructor(loader: ObjectLoader, regions: Regions) {
    this._loader = loader;
    this._regions = regions;
    this._cachedRegions = {};
  }

  setActive(x, y, w, h) {
    var regions = this._regions.query(x, y, w, h);
    var loader = this;

    regions.forEach(function(region) {
      loader._loadRegionObjects(region);
    });
  }

/*
be able to query objects and background efficiently
- should come from object loader because you'll want to load chunks of the map
  definition, which means querying the map def for a region. objectloader will
  need a client-side cache of objects though, since a player might briefly leave a region
  then return and the objects there should maintain state.

  objects can move between regions. need to query from world?
*/
// For the short term, I might just brute force this
  _loadRegionObjects(regionConfig) {

    var key = [regionConfig.x, regionConfig.y, regionConfig.w, regionConfig.h].join('-');
    var region = this._cachedRegions[key];

    // TODO there's a difference between loaded and active
    if (!region) {
      region = this._loader.load(regionConfig).get(Region);
      this._cachedRegions[key] = region;
    }

    region.load();
  }
}


// TODO need a better name?
@SceneScope
class ActiveRegion {

  constructor(scene: Scene, regionLoader: RegionLoader, player: Player) {
    this._x = 0;
    this._y = 0;
    // TODO hard-coded
    this._width = 320;
    this._height = 320;

    this._anchorX = 0.5;
    this._anchorY = 0.5;

    this._regionLoader = regionLoader;

    var activeRegion = this;

    scene.events.on('tick', function() {

      var body = player.get(Body);
      var pos = body.getPosition();

      activeRegion.setPosition(pos.x, pos.y);
    });
  }

  _update() {
    var rx = this._x - this._width * this._anchorX;
    var ry = this._y - this._height * this._anchorY;

    this._regionLoader.setActive(rx, ry, this._width, this._height);
  }

  getPosition() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  setPosition(x, y) {
    this._x = x;
    this._y = y;
    this._update();
  }

  // TODO even need anchor? probably should just have one way
  setAnchor(dx, dy) {
    this._anchorX = dx;
    this._anchorY = dy;
  }

  resize(w, h) {
    this._width = w;
    this._height = h;
    this._update();
  }
}


@ObjectScope
class Region {

  constructor(objectLoader: ObjectLoader, map: WorldMap, regionConfig: ObjectConfig,
              backgroundGrid: BackgroundGrid) {

    this._objectLoader = objectLoader;
    this._map = map;
    this._regionConfig = regionConfig;
    this._backgroundGrid = backgroundGrid;
    this.enabled = true;
    this.loaded = false;
  }

  load() {
    if (!this.enabled || this.loaded) {
      return;
    }

    // TODO improve on this?
    this.loaded = true;

    var objectLoader = this._objectLoader;
    var map = this._map;
    var regionConfig = this._regionConfig;
    var backgroundGrid = this._backgroundGrid;

    // TODO in the future this won't have access to map, since map will be loaded
    //      in pieces
    //      or maybe Region will be given all the objects in that region?
    map.objectlayers.forEach(function(layer) {
      layer.forEach(function(objectConfig) {
        if (!objectConfig.hasType('region') && inRegion(objectConfig)) {
          objectLoader.load(objectConfig);
        }
      });
    });

    map.tilelayers.forEach(function(layer) {
      layer.forEach(function(tile) {
        if (inRegion(tile)) {
          backgroundGrid.grid.push(tile);
        }
      });
    });

    function inRegion(item) {
      var iw = item.w || item.width;
      var ih = item.h || item.height;
      var ix1 = item.x;
      var iy1 = item.y;
      var ix2 = ix1 + iw;
      var iy2 = iy1 + ih;

      var rw = regionConfig.w;
      var rh = regionConfig.h;
      var rx1 = regionConfig.x;
      var ry1 = regionConfig.y;
      var rx2 = rx1 + rw;
      var ry2 = ry1 + rh;

      return ix2 >= rx1 && ix1 <= rx2 && iy2 >= ry1 && iy1 <= ry2;
    }
  }
}

Types['region'] = new Loader().runs(Region);
