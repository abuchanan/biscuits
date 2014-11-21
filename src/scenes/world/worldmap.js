define(['./map/loaders/TiledJSONRegions'], function(loadTiledJSONRegions) {

    // Module exports
    return function(s) {
      s.map = loadTiledJSONRegions.load(s.config.mapID,
                                        s.config.initialPlayerPosition);
    };
});
