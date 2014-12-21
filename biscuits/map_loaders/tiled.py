import uuid

from kivy.core.image import Image as CoreImage
from kivy.uix.image import Image as UIImage
import pytmx

# TODO need a plugin system and graceful way to do this
from biscuits.geometry import Rectangle
from biscuits.World import Direction



class Tile:
    def __init__(self, rectangle, image):
        self.type = 'tile'
        self.rectangle = rectangle
        self.image = image


# TODO be consistent about "name" vs "ID" throughout biscuits
class TiledMap:

    def __init__(self, path):
        self._map = pytmx.TiledMap(filename=str(path),
                                   image_loader=KivyImageLoader)

        self.tilewidth = self._map.tilewidth
        self.tileheight = self._map.tileheight
        self.width = self._map.width
        self.height = self._map.height

        tiles_pass = TilesPass(self.tilewidth, self.tileheight, self.height)
        tiles_pass.run(self._load_tiles())

        objects_pass = ObjectsPass(self.tilewidth, self.tileheight, self.height)
        objects_pass.run(self._load_object_configs())

        regions_pass = RegionObjectsPass(objects_pass.regions)
        regions_pass.run(objects_pass.objects.values())
        regions_pass.run(tiles_pass.tiles)

        self.regions = regions_pass.regions
        self.loadpoints = objects_pass.loadpoints
        self.objects = objects_pass.objects


    def _load_object_configs(self):
        groups_i = self._map.visible_object_groups
        groups = (self._map.layers[i] for i in groups_i)
        return list(obj for group in groups for obj in group)

    def _load_tiles(self):
        layers_i = self._map.visible_tile_layers
        layers = (self._map.layers[i] for i in layers_i)
        return list(tile for layer in layers for tile in layer.tiles())


class Pass:

    def before_each(self, item):
        pass

    def after_each(self, item):
        pass

    def run(self, items):
        for item in items:
            self.before_each(item)

            try:
                method = getattr(self, 'handle_' + item.type)
            except AttributeError:
                pass
            else:
                method(item)

            self.after_each(item)


class TilesPass(Pass):

    def __init__(self, tile_width, tile_height, map_height):
        self.tile_width = tile_width
        self.tile_height = tile_height
        self.map_height = map_height
        self.tiles = []

    def before_each(self, obj):
        x, y, texture = obj
        y = self.map_height - y - 1

        # TODO this is probably slow. could be more lazy and only load UI Image
        #      (and texture for that matter) when needed 
        image = UIImage(texture=texture, size=texture.size)
        image.x = x * self.tile_width
        image.y = y * self.tile_height
        image.size = (self.tile_width, self.tile_width)
        image.size_hint = (None, None)

        rectangle = Rectangle(x, y, 1, 1)

        tile = Tile(rectangle, image)
        self.tiles.append(tile)


class ObjectsPass(Pass):

    def __init__(self, tile_width, tile_height, map_height):
        self.tile_width = tile_width
        self.tile_height = tile_height
        self.map_height = map_height
        self.loadpoints = {}
        self.regions = []
        self.objects = {}
        # TODO move this
        self.ignore = ('SquirrelLock', 'DoorSwitch')

    def before_each(self, obj):
        obj.width = obj.width / self.tile_width
        obj.height = obj.height / self.tile_height

        obj.x = obj.x / self.tile_width
        obj.y = self.map_height - (obj.y / self.tile_width) - obj.height
        obj.rectangle = Rectangle(obj.x, obj.y, obj.width, obj.height)

        if not obj.name:
            obj.name = str(uuid.uuid4())

    def handle_Region(self, obj):
        region = Region(obj.name, obj.rectangle)
        self.regions.append(region)

    def handle_Coin(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))

    def handle_CoinChest(self, obj):
        obj.coin_value = int(getattr(obj, 'coinValue', 1))

    def handle_Loadpoint(self, obj):
        obj.direction = Direction[obj.direction]
        self.loadpoints[obj.name] = obj

    def after_each(self, obj):
        if obj.type in self.ignore:
            return

        self.objects[obj.name] = obj


class RegionObjectsPass(Pass):
    def __init__(self, regions):
        self.regions = regions

    def before_each(self, obj):

        # TODO this would add to multiple regions if they overlapped
        for region in self.regions:
            if obj.rectangle.overlaps(region.rectangle):
                if obj.type == 'Region':
                    continue
                elif obj.type == 'tile':
                    region.tiles.append(obj)
                elif obj.type == 'Loadpoint':
                    obj.region = region
                else:
                    region.object_IDs.append(obj.name)



class Region:

    def __init__(self, ID, rectangle):
        self.ID = ID
        self.rectangle = rectangle
        self.tiles = []
        self.object_IDs = []


class KivyImageLoader:
    """
    Loads Kivy images. Make sure that there is an active OpenGL context
    (Kivy Window) before trying to load a map.
    """

    def __init__(self, filename, colorkey):
        self._texture = CoreImage(filename).texture

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
