define(['./map/loaders/TiledJSONRegions'], function(loadTiledJSONRegions) {

    // Module exports
    return function(scene) {
      scene.map = loadTiledJSONRegions.load(scene.config.mapID,
                                            scene.config.initialPlayerPosition);
    };
});
