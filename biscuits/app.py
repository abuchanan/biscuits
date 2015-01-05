from functools import partial
import logging
import math
from pathlib import Path
import weakref

from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.screenmanager import ScreenManager, Screen

import biscuits.objects
from biscuits.comic_scene import ComicScene
from biscuits.dead import DeadScene
from biscuits.debug import DebugWidget
from biscuits.hud import HUDWidget
from biscuits.input import Input
from biscuits.map_loaders.tiled import TiledMap
from biscuits.player import Player
from biscuits.start_scene import StartScene
from biscuits.World import World


log = logging.getLogger('biscuits')

maps_path = Path(__file__).parent / '..' / 'maps' / 'Tiled_data'
# TODO needs to come from loadpoint or something
map_path = (maps_path / 'Level 1' / 'Level 1.tmx').resolve()
# TODO needs a service for loading and caching
map = TiledMap(map_path)

map_cache = {}

def load_map(path):
    try:
        return map_cache[path]
    except KeyError:
        map = TiledMap(path)
        map_cache[path] = map
        return map

class Loadpoint:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

loadpoints = map.loadpoints

loadpoints['start'] = Loadpoint(type='start')
loadpoints['dead'] = Loadpoint(type='dead')
loadpoints['comic 1'] = Loadpoint(type='comic', path=Path('media/comic-1'), pages=2,
                                  exitpoint='start')
loadpoints['win comic'] = Loadpoint(type='comic', path=Path('media/win-comic'), pages=1,
                                    exitpoint='start')

loadpoints['boss squirrel comic'] = Loadpoint(type='comic', path=Path('media/boss squirrel'),
                                    sound='media/sounds/Boss Squirrel.wav',
                                    pages=1,
                                    exitpoint='Loadpoint 6a')


class UnknownObjectType(Exception): pass


from biscuits.objects.chest import Chest, CoinChest
from biscuits.objects.coin import Coin
from biscuits.objects.door import Door
from biscuits.objects.door_switch import DoorSwitch
from biscuits.objects.jar import Jar
from biscuits.objects.key import Key
from biscuits.objects.squirrel import Squirrel
from biscuits.objects.boss_squirrel import BossSquirrel
from biscuits.objects.wall import Wall

# TODO maybe object loader should be the owner of all objects and return
#      only weak references. 
class ObjectLoader:

    def __init__(self, configs, world, app):
        self.configs = configs
        self.world = world
        self.app = app
        self.cache = {}

    def __getitem__(self, ID):
        return self.load(ID)

    def load(self, ID):
        try:
            return self.cache[ID]
        except KeyError:
            pass

        config = self.configs[ID]

        try:
            cls = getattr(biscuits.objects, config.type)
        except AttributeError:
            raise UnknownObjectType('Unknown object type: {}'.format(config.type))
        else:
            obj = cls(ID, self, self.world, self.app)
            obj.init_from_config(config)
            self.cache[ID] = obj
            return obj


class Region:

    def __init__(self, loader, region_config):

        self.loader = loader
        self.widget = RelativeLayout()
        self.objects = set()

        for tile in region_config.tiles:
            self.widget.add_widget(tile.image)

        for ID in region_config.object_IDs:
            self.load_object(ID)


    def update(self, dt):
        for obj in self.objects:
            obj.update(dt)


    def load_object(self, ID):
        obj = self.loader.load(ID)

        obj.signals.destroy.connect(self.cleanup)
        self.objects.add(obj)

        try:
            self.widget.add_widget(obj.widget)
        except AttributeError:
            pass

    def cleanup(self, obj):
        self.objects.remove(obj)

        # TODO consider using weakref.finalize
        try:
            self.widget.remove_widget(obj.widget)
        except AttributeError:
            pass


class BiscuitsGame:

    def __init__(self, app):

        # TODO pretty sure this causes circular references that prevent
        #      garbage collection of the whole scene
        self.app = app
        self.world = World()
        self.widget = RelativeLayout()
        self.objects_layer = RelativeLayout()

        self.objects_loader = ObjectLoader(map.objects, self.world, app)

        # TODO figure out a nice way to get rid of this
        self.tilewidth = map.tilewidth
        self.tileheight = map.tileheight

        self.region = None
        self.region_cache = {}

        # TODO try to use ObjectsLoader for player too
        player = self.player = Player('player', self.objects_loader, self.world, app)
        player.init(0, 0)
        player.widget.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale player images
        player.widget.size = (self.tileheight, self.tilewidth)
        player.widget.size_hint = (None, None)
        player.signals.dead.connect(self.dead)
        self.player = player
        self.world.add(player)

        self.hud = HUDWidget(size_hint=(1, .05), pos_hint={'top': 1})
        # TODO move debug to app
        debug = DebugWidget(player, size_hint=(1, .05))

        self.widget.add_widget(self.objects_layer)
        self.widget.add_widget(player.widget)
        self.widget.add_widget(self.hud)
        self.widget.add_widget(debug)

    def dead(self, *args):
        self.app.load_scene('dead')

    def load(self, loadpoint):

        # Unload the current region
        # TODO would be stellar if weak references could account
        #      for all of this
        if self.region:
            self.objects_layer.remove_widget(self.region.widget)
            for obj in self.region.objects:
                # TODO use weakref
                self.world.remove(obj)

        region_config = loadpoint.region

        try:
            self.region = self.region_cache[region_config.ID]
        except KeyError:
            self.region = Region(self.objects_loader, region_config)
            self.region_cache[region_config.ID] = self.region

        # TODO can use weakref to pass reference to add_widget()?
        #      would be awesome for maintaining ownership!
        self.objects_layer.add_widget(self.region.widget)
        self.player.set_position(loadpoint.x, loadpoint.y, loadpoint.direction)

        for obj in self.region.objects:
            # TODO use weakref
            obj.signals.destroy.connect(self.world.remove)
            self.world.add(obj)

        return self


    def update(self, dt):
        if self.region:
            self.region.update(dt)

        self.player.update(dt)
        self.hud.coins = self.player.coins.balance
        self.hud.health = self.player.health.balance
        self.hud.keys = self.player.keys.balance
        self.track_player()

    def unload(self):
        pass

    def track_player(self):
        x = math.floor((self.player.body.x + 0.5) * self.tilewidth)
        y = math.floor((self.player.body.y + 0.5) * self.tileheight)

        self.objects_layer.x = self.widget.center_x - x
        self.objects_layer.y = self.widget.center_y - y


class BiscuitsApp(App):

    def __init__(self):
        super().__init__()
        self.widget = RelativeLayout()
        self._scene = None
        self.input = Input()
        self.game = BiscuitsGame(self)

        # TODO some screens, such as inventory or storefront, will want access
        #      to the player object. but that's currently buried in the world
        #      scene.

    @property
    def scene(self):
        return self._scene

    @scene.setter
    def scene(self, scene):
        if self._scene:
            self._scene.unload()
            self.widget.remove_widget(self._scene.widget)

        self._scene = scene
        self.widget.add_widget(scene.widget)

    def load_scene(self, loadpoint_ID):
        loadpoint = loadpoints[loadpoint_ID]

        if loadpoint.type == 'dead':
            self.scene = DeadScene(self)

        elif loadpoint.type == 'start':
            self.scene = StartScene(self)

        elif loadpoint.type == 'comic':
            self.scene = ComicScene(self, loadpoint)
        else:
            self.scene = self.game.load(loadpoint)

    def update(self, dt):
        self.input.update(dt)
        self.scene.update(dt)

    def build(self):
        EventLoop.ensure_window()
        #self.load_scene('comic 1')
        self.load_scene('Loadpoint 6a')
        Clock.schedule_interval(self.update, 1.0 / 60.0)

        return self.widget
