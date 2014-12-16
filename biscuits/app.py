from functools import partial
import logging
import math
from pathlib import Path

from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.image import Image

import biscuits.objects
from biscuits.debug import DebugWidget
from biscuits.hud import HUDWidget
from biscuits.Player import Player
from biscuits.World import World, Direction
from biscuits.map_loaders.tiled import TiledMap


log = logging.getLogger('biscuits')

maps_path = Path(__file__).parent / '..' / 'maps' / 'Tiled_data'


# TODO don't subclass layout, provide as "game.widget"
class BiscuitsGame(RelativeLayout):

    def load_scene(self, ID):
        map_path = (maps_path / 'Level 1' / 'Level 1.tmx').resolve()
        map = TiledMap(map_path)

        self.tilewidth = map.tilewidth
        self.tileheight = map.tileheight

        loadpoint = map.loadpoints[ID]
        region = loadpoint.region

        self.clear_widgets()
        self.world = World()

        self.objects_layer = RelativeLayout()
        self.add_widget(self.objects_layer)

        for tile_layer in region.tile_layers:
            for tile in tile_layer.tiles:
                # TODO move this
                x, y, texture = tile
                image = Image(texture=texture, size=texture.size)
                image.x = x * self.tilewidth
                image.y = (map.height - y - 1) * self.tileheight
                image.size = (self.tileheight, self.tilewidth)
                image.size_hint = (None, None)
                self.objects_layer.add_widget(image)

        for config in region.objects:
            self.load_object(config)

        start_x = int(loadpoint.config.x)
        start_y = int(loadpoint.config.y)
        start_direction = Direction[loadpoint.config.direction]

        player = self.player = Player(self.world, start_x, start_y,
                                      start_direction)
        player.widget.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale player images
        player.widget.size = (self.tileheight, self.tilewidth)
        player.widget.size_hint = (None, None)
        self.add_widget(player.widget)

        self.hud = HUDWidget(size_hint=(1, .05), pos_hint={'top': 1})
        self.add_widget(self.hud)

        debug = DebugWidget(size_hint=(1, .05))
        self.add_widget(debug)

    def update(self, dt):
        for obj in self.world:
            obj.update(dt)
        
        self.player.update(dt)
        self.hud.coins = self.player.coins.balance
        self.hud.health = self.player.health.balance
        self.hud.keys = self.player.keys.balance
        self.track_player()

    def track_player(self):
        x = math.floor((self.player.body.x + 0.5) * self.tilewidth)
        y = math.floor((self.player.body.y + 0.5) * self.tileheight)

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
            obj.signals.load_scene.connect(self.load_scene)
            self.world.add(obj)

            try:
                self.objects_layer.add_widget(obj.widget)
            except AttributeError:
                pass


class BiscuitsApp(App):

    def build(self):
        EventLoop.ensure_window()

        game = BiscuitsGame()
        game.load_scene('Loadpoint 1a')
        Clock.schedule_interval(game.update, 1.0 / 60.0)

        return game
