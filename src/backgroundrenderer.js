function BackgroundRenderer(tiles, container) {
  var region = ActiveBackgroundRegion(container.width, container.height, tiles);
  var renderable = new TileBatchRenderable(region.forEachTile);
  container.addChild(renderable);

  // TODO
  container.on('resize', region.resize);

  return {
    region: region,
  };
}
