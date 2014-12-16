from functools import partial
import logging
import math
from pathlib import Path

from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.uix.relativelayout import RelativeLayout

import biscuits.objects
from biscuits.debug import DebugWidget
from biscuits.hud import HUDWidget
from biscuits.TileGrid import TileGrid
from biscuits.Player import Player
from biscuits.World import World
from biscuits.map_loaders.tiled import TiledMap


log = logging.getLogger('biscuits')

maps_path = Path(__file__).parent / '..' / 'maps' / 'Tiled_data'


class BiscuitsGame(RelativeLayout):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        map_path = (maps_path / 'foo.tmx').resolve()

        map = self.map = TiledMap(map_path)

        # TODO hard-coded
        # TODO handle multiple tile layers
        tile_layer = map.load_tile_layers()[0]
        self.grid = TileGrid(tile_layer, map.tileheight, map.tilewidth)
        self.add_widget(self.grid)

        self.world = World()

        objects_layer = RelativeLayout()
        self.objects_layer = objects_layer
        self.add_widget(objects_layer)

        for config in map.load_objects():
            self.load_object(config)

        player = self.player = Player(self.world)
        player.widget.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale player images
        player.widget.size = (map.tileheight, map.tilewidth)
        player.widget.size_hint = (None, None)
        self.add_widget(player.widget)

        self.hud = HUDWidget(size_hint=(1, .05), pos_hint={'top': 1})
        self.add_widget(self.hud)

        debug = DebugWidget(size_hint=(1, .05))
        self.add_widget(debug)

        Clock.schedule_interval(self.update, 1 / 60)

    def update(self, dt):
        for obj in self.world:
            obj.update(dt)
        
        self.player.update(dt)
        self.hud.coins = self.player.coins.balance
        self.hud.health = self.player.health.balance
        self.hud.keys = self.player.keys.balance
        self.track_player()

    # TODO abstract to reusable component
    def track_player(self):
        # TODO could (should) use grid layout details instead of map tile details
        #      that would account for any extra information defined in the grid
        #      (e.g. padding, scaling, etc)
        x = math.floor((self.player.body.x + 0.5) * self.map.tilewidth)
        y = math.floor((self.player.body.y + 0.5) * self.map.tileheight)

        # TODO getting low FPS during movement, seems to be happening here
        #      I guess it's not surprising since all those sprites are moving
        #      Grid layout probably isn't the best option
        self.grid.x = self.center_x - x
        self.grid.y = self.center_y - y

        self.objects_layer.x = self.center_x - x
        self.objects_layer.y = self.center_y - y

    def cleanup(self, obj):
        try:
            self.world.remove(obj)
        except ValueError:
            pass

        try:
            self.objects_layer.remove_widget(obj.widget)
        except AttributeError:
            pass

    def load_object(self, config):
        try:
            cls = getattr(biscuits.objects, config.type)
        except AttributeError:
            log.warning('Unknown object type: {}'.format(config.type))
        else:
            obj = cls.from_config(config)

            obj.signals.destroy.connect(self.cleanup)
            self.world.add(obj)

            try:
                self.objects_layer.add_widget(obj.widget)
            except AttributeError:
                pass


class BiscuitsApp(App):

    def build(self):
        EventLoop.ensure_window()

        game = BiscuitsGame()
        Clock.schedule_interval(game.update, 1.0 / 60.0)

        return game
