import re

from kivy.properties import BooleanProperty

from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class DoorWidget(BasicWidget):

    locked = BooleanProperty(False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.color.rgb = (0, 1, 1)
        self.bind(locked=self.redraw)

    def redraw(self, *args, **kwargs):
        if self.locked:
            self.color.rgb = (0, 0, 0)
        else:
            self.color.rgb = (0, 1, 1)
            


class Door(Base):

    def init(self, rectangle, destination, locks=None):

        self.body = Body(*rectangle, is_block=True)
        self.destination = destination

        if locks is None:
            self._locks = []
        else:
            self._locks = locks

        # TODO resolve this tile width/height crap
        pos = (rectangle.x * 32, rectangle.y * 32)
        size = (rectangle.w * 32, rectangle.h * 32)
        self.widget = DoorWidget(pos=pos, size=size)

        if self._locks:
            self.widget.locked = True

        for lock in self._locks:
            obj = self.objects[lock]
            # TODO this is an intersting case *against* using weakref.
            #      there's a difference between being destroyed in the game
            #      (e.g. via attack) and being created/destroyed in the cycle
            #      of region/map loading/unloading. weakref is probably still
            #      useful, but the terminaology and use of the different cases
            #      needs to be clear
            obj.signals.destroy.connect(self.on_lock_destroyed)

        self.signals.player_collision.connect(self.on_player_collision)

    def on_lock_destroyed(self, obj):
        self.remove_lock(obj.ID)

    def add_lock(self, name):
        self._locks.append(name)
        self.widget.locked = True

    def remove_lock(self, name):
        self._locks.remove(name)

        if not self._locks:
            self.widget.locked = False

    def on_player_collision(self, player):
        if 'generic' in self._locks and player.keys.balance > 0:
            player.keys.balance -= 1
            self.remove_lock('generic')

        if not self._locks:
            self.signals.load_scene.send(self.destination)

    def init_from_config(self, config):
        try:
            locks = re.split(', *', config.locks)
        except AttributeError:
            locks = None

        self.init(config.rectangle, config.Destination, locks=locks)
