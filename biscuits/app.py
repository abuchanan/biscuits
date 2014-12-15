import math
from pathlib import Path

from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.uix.widget import Widget
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.relativelayout import RelativeLayout

from TileGrid import TileGrid
from TiledMap import TiledMap
from Player import Player
from World import World
from geometry import Rectangle as BoundingBox


maps_path = Path(__file__).parent / '..' / 'maps' / 'Tiled_data'


class Wall:
    def __init__(self, x, y, w, h):
        self.bb = BoundingBox(x, y, w, h)
        self.is_block = True


def load_object_groups(map, world):
    for group_i in map.visible_object_groups:
        for obj in map.layers[group_i]:
            if obj.type == 'Wall':
                w = obj.width / map.tilewidth
                h = obj.height / map.tileheight

                x = obj.x / map.tilewidth
                y = map.height - (obj.y / map.tileheight) - h

                wall = Wall(x, y, w, h)
                world.add(wall)


class BiscuitsGame(RelativeLayout):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        map_path = maps_path / 'foo.tmx'
        map_path = str(map_path.resolve())

        map = TiledMap(filename=map_path)

        # TODO hard-coded
        # TODO handle multiple tile layers
        tile_layer = next(map.visible_tile_layers)
        grid = TileGrid(tile_layer, map.tileheight, map.tilewidth)

        world = World()
        load_object_groups(map, world)

        player = Player(world)
        player.widget.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale player images
        player.widget.size = (map.tileheight, map.tilewidth)
        player.widget.size_hint = (None, None)

        self.map = map
        self.grid = grid
        self.player = player

        self.add_widget(grid)
        self.add_widget(player.widget)

        Clock.schedule_interval(self.update, 1 / 60)

    def update(self, dt):
        self.player.update(dt)
        self.track_player()

    # TODO abstract to reusable component
    def track_player(self):
        # TODO could (should) use grid layout details instead of map tile details
        #      that would account for any extra information defined in the grid
        #      (e.g. padding, scaling, etc)
        x = math.floor((self.player.bb.x + 0.5) * self.map.tilewidth)
        y = math.floor((self.player.bb.y + 0.5) * self.map.tileheight)

        self.grid.x = self.center_x - x
        self.grid.y = self.center_y - y


class BiscuitsApp(App):

    def build(self):
        EventLoop.ensure_window()

        game = BiscuitsGame()
        Clock.schedule_interval(game.update, 1.0 / 60.0)

        return game


if __name__ == '__main__':
    BiscuitsApp().run()
