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
from biscuits.objects.base import Config
from biscuits.comic_scene import ComicScene
from biscuits.dead import DeadScene
from biscuits.debug import DebugWidget
from biscuits.hud import HUDWidget
from biscuits.input import Input
from biscuits.map_loaders.tiled import TiledMap
from biscuits.player import Player
from biscuits.start_scene import StartScene
from biscuits.World import World
from biscuits.objectloader import ObjectLoader
from biscuits.region import Region


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

class Loadpoint(Config): pass

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





class WorldScene:
    def __init__(self, object_configs, world, app):
        # TODO circular reference to scene?
        self.objects = ObjectLoader(object_configs, self)
        self.world = world
        self.app = app
        self.input = app.input

    def load_scene(self, name):
        self.app.load_scene(name)


class BiscuitsGame:

    def __init__(self, app):

        # TODO pretty sure this causes circular references that prevent
        #      garbage collection of the whole scene
        self.app = app
        self.world = World()
        self.widget = RelativeLayout()
        self.objects_layer = RelativeLayout()

        object_configs = dict(map.objects)
        object_configs['player'] = Config(type='Player',
                                          body=Config(x=0, y=0, w=1, h=1))

        scene = WorldScene(object_configs, self.world, app)
        self.scene = scene

        # TODO figure out a nice way to get rid of this
        self.tilewidth = map.tilewidth
        self.tileheight = map.tileheight

        self.region = None
        self.region_cache = {}

        player = scene.objects.load('player')

        self.player = player
        self.world.add(player)

        self.hud = HUDWidget(size_hint=(1, .05), pos_hint={'top': 1})
        # TODO move debug to app
        debug = DebugWidget(player, size_hint=(1, .05))

        self.widget.add_widget(self.objects_layer)
        self.widget.add_widget(player.widget._kivy_widget)
        self.widget.add_widget(self.hud)
        self.widget.add_widget(debug)

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
            self.region = Region(self.scene.objects, region_config)
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

        self.player.signals.update.send(dt)
        self.hud.coins = self.player.coins.balance
        self.hud.keys = self.player.keys.balance
        self.hud.health = self.player.life.amount
        self.track_player()

    def unload(self):
        pass

    def track_player(self):
        x = math.floor((self.player.body.bb.x + 0.5) * self.tilewidth)
        y = math.floor((self.player.body.bb.y + 0.5) * self.tileheight)

        self.objects_layer.x = self.widget.center_x - x
        self.objects_layer.y = self.widget.center_y - y


class BiscuitsApp(App):

    def __init__(self):
        super().__init__()
        self.widget = RelativeLayout()
        self._scene = None
        self.input = Input()
        self.game = BiscuitsGame(self)

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
        self.load_scene('Loadpoint 1a')
        Clock.schedule_interval(self.update, 1.0 / 60.0)

        return self.widget
