import math
from pathlib import Path

from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.graphics import *
from kivy.uix.widget import Widget
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.label import Label
from kivy.properties import NumericProperty

from TileGrid import TileGrid
from TiledMap import TiledMap
from Player import Player
from World import World, Body


maps_path = Path(__file__).parent / '..' / 'maps' / 'Tiled_data'


class Wall:

    def __init__(self, x, y, w, h):
        self.body = Body(x, y, w, h, is_block=True)

    def update(self, dt):
        pass


class BasicItemWidget(Widget):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.size_hint = (None, None)

        with self.canvas:
            PushState('color')
            self.color = Color(1, 0, 0)
            self.rect = Rectangle(pos=self.pos, size=self.size)
            PopState('color')

    def remove(self):
        if self.parent:
            self.parent.remove_widget(self)


class BasicItem:

    def __init__(self, name, x, y, w, h, value, world):
        self.name = name
        # TODO resolve this tile width/height crap
        self.widget = BasicItemWidget(pos=(x * 32, y * 32), size=(32, 32))
        self.body = Body(x, y, w, h)
        self.world = world
        self.value = value
        world.add(self)

    def update(self, dt):
        for hit in self.world.query(self.body):
            if isinstance(hit, Player):
                getattr(hit, self.name).balance += self.value
                self.widget.remove()
                self.world.remove(self)
                break


class Coin(BasicItem):

    def __init__(self, *args, **kwargs):
        super().__init__('coins', *args, **kwargs)


class Key(BasicItem):

    def __init__(self, *args, **kwargs):
        super().__init__('keys', *args, **kwargs)
        self.widget.color.rgb = (1, 1, 0)


class Chest:

    def __init__(self, x, y, w, h, world):
        # TODO resolve this tile width/height crap
        self.widget = BasicItemWidget(pos=(x * 32, y * 32), size=(32, 32))
        self.widget.color.rgb = (0, 0, 1)
        self.body = Body(x, y, w, h, is_block=True)
        world.add(self)
        self.is_open = False

    def on_use(self, player):
        if not self.is_open:
            self.is_open = True
            self.widget.color.rgb = (0, 0, 0)
            self.on_chest_opened(player)

    def on_chest_opened(self, player):
        pass

    def update(self, dt):
        pass


class CoinChest(Chest):

    def __init__(self, x, y, w, h, world, value=1):
        super().__init__(x, y, w, h, world)
        self.value = value

    def on_chest_opened(self, player):
        player.coins.balance += self.value


class Jar:

    def __init__(self, x, y, w, h, world):
        # TODO resolve this tile width/height crap
        self.widget = BasicItemWidget(pos=(x * 32, y * 32), size=(32, 32))
        self.widget.color.rgb = (.5, .25, 0)
        self.body = Body(x, y, w, h, is_block=True)
        self.world = world
        world.add(self)

    def on_attack(self, player):
        print('attacked!')
        self.world.remove(self)
        self.widget.remove()

    def update(self, dt):
        pass


def load_object_groups(map, world, container):
    for group_i in map.visible_object_groups:
        for obj in map.layers[group_i]:

            w = obj.width / map.tilewidth
            h = obj.height / map.tileheight

            x = obj.x / map.tilewidth
            y = map.height - (obj.y / map.tileheight) - h

            if obj.type == 'Wall':
                wall = Wall(x, y, w, h)
                world.add(wall)

            elif obj.type == 'Coin':
                try:
                    value = int(obj.coinValue)
                except AttributeError:
                    value = 1
                coin = Coin(x, y, w, h, value, world)
                # TODO move to Coin constructor?
                container.add_widget(coin.widget)

            elif obj.type == 'Key':
                key = Key(x, y, w, h, 1, world)
                container.add_widget(key.widget)

            elif obj.type == 'Chest':
                chest = Chest(x, y, w, h, world)
                container.add_widget(chest.widget)

            elif obj.type == 'CoinChest':
                try:
                    value = int(obj.coinValue)
                except AttributeError:
                    value = 1

                chest = CoinChest(x, y, w, h, world, value)
                container.add_widget(chest.widget)

            elif obj.type == 'Jar':
                jar = Jar(x, y, w, h, world)
                container.add_widget(jar.widget)


class HUDWidget(BoxLayout):

    coins = NumericProperty(0)
    keys = NumericProperty(0)
    health = NumericProperty(0)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with self.canvas.before:
            PushState('color')
            Color(0, 0, 0, 1)
            self.rect = Rectangle(size=self.size, pos=self.pos)
            PopState('color')

        self.health_label = Label(text='Health: ' + str(self.health))
        self.bind(health=self.redraw)
        self.add_widget(self.health_label)

        self.coins_label = Label(text='Coins: ' + str(self.coins))
        self.bind(coins=self.redraw)
        self.add_widget(self.coins_label)

        self.keys_label = Label(text='Keys: ' + str(self.keys))
        self.bind(keys=self.redraw)
        self.add_widget(self.keys_label)

        self.bind(pos=self.redraw, size=self.redraw)

    def redraw(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.coins_label.text = 'Coins: ' + str(self.coins)
        self.health_label.text = 'Health: ' + str(self.health)
        self.keys_label.text = 'Keys: ' + str(self.keys)


class DebugPanel(BoxLayout):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with self.canvas.before:
            PushState('color')
            Color(0, 0, 0, 1)
            self.rect = Rectangle(size=self.size, pos=self.pos)
            PopState('color')

        self.label = Label(text='FPS: ')
        self.add_widget(self.label)
        self.bind(pos=self.update, size=self.update)
        Clock.schedule_interval(self.update, .1)

    def update(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.label.text = 'FPS: ' + str(int(Clock.get_fps()))


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
        self.add_widget(grid)

        world = World()
        self.world = world
        objects_layer = RelativeLayout()
        self.objects_layer = objects_layer
        self.add_widget(objects_layer)
        load_object_groups(map, world, objects_layer)

        player = Player(world)
        player.widget.pos_hint = {'center_x': 0.5, 'center_y': 0.5}
        # TODO scale player images
        player.widget.size = (map.tileheight, map.tilewidth)
        player.widget.size_hint = (None, None)

        self.map = map
        self.grid = grid
        self.player = player

        self.add_widget(player.widget)

        self.hud = HUDWidget(size_hint=(1, .05), pos_hint={'top': 1})
        self.add_widget(self.hud)

        debug = DebugPanel(size_hint=(1, .05))
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


class BiscuitsApp(App):

    def build(self):
        EventLoop.ensure_window()

        game = BiscuitsGame()
        Clock.schedule_interval(game.update, 1.0 / 60.0)

        return game


if __name__ == '__main__':
    BiscuitsApp().run()
