from kivy.core.image import Image
import pytmx

# TODO need a plugin system and graceful way to do this
from biscuits.geometry import Rectangle


class TiledMap:

    def __init__(self, path):
        self._map = pytmx.TiledMap(filename=str(path),
                                   image_loader=KivyImageLoader)

        self.tilewidth = self._map.tilewidth
        self.tileheight = self._map.tileheight
        self.width = self._map.width
        self.height = self._map.height

    def _iter_layers(self, indices):
        return (self._map.layers[i] for i in indices)

    def load_tile_layers(self):
        return list(self._iter_layers(self._map.visible_tile_layers))

    def load_objects(self):
        tile_w = self._map.tilewidth
        tile_h = self._map.tileheight

        objects = []

        for group in self._iter_layers(self._map.visible_object_groups):
            for obj in group:

                obj.width = obj.width / tile_w
                obj.height = obj.height / tile_h

                obj.x = obj.x / tile_w
                obj.y = self._map.height - (obj.y / tile_w) - obj.height
                obj.rectangle = Rectangle(obj.x, obj.y, obj.width, obj.height)

                self.visit(obj)
                objects.append(obj)

        return objects

    def visit(self, obj):
        try:
            method = getattr(self, 'handle_' + obj.type)
            method(obj)
        except AttributeError:
            pass

    def handle_Coin(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))

    def handle_CoinChest(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))


class KivyImageLoader:
    """
    Loads Kivy images. Make sure that there is an active OpenGL context
    (Kivy Window) before trying to load a map.
    """

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
