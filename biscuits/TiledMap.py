from kivy.core.image import Image
import pytmx


class TiledMap(pytmx.TiledMap):
    """
    Loads Kivy images. Make sure that there is an active OpenGL context
    (Kivy Window) before trying to load a map.
    """

    def __init__(self, **kwargs):
        kwargs['image_loader'] = KivyImageLoader
        super().__init__(**kwargs)

    @property
    def visible_tile_layers(self):
        return (self.layers[i] for i in super().visible_tile_layers)


class KivyImageLoader:

    def __init__(self, filename, colorkey):
        self._texture = Image(filename).texture
        print(self._texture.height)

    def __call__(self, rect, flags):

        # Kivy uses a window coordinate system: origin is bottom/left,
        # and regions are sliced from bottom/left to top/right.
        #
        # Tiled has a different coordinate system: the y-axis is flipped,
        # origin is top/right, and regions are sliced from top/left to
        # bottom/right.
        #
        # So, we need to transform the y-coordinate.
        x, y, w, h = rect
        y = self._texture.height - y - h
        return self._texture.get_region(x, y, w, h)
