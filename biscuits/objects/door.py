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
            

class Lock:
    def __init__(self):
        self.locked = True

    def update(self, dt):
        pass


class SwitchLock(Lock):

    def __init__(self, obj):
        super().__init__()
        obj.signals.switch_active.connect(self.on_switch_active)

    def on_switch_active(self, *args):
        self.locked = False


class ObjectLock(Lock):

    def __init__(self, obj):
        super().__init__()
        # TODO this is an intersting case *against* using weakref.
        #      there's a difference between being destroyed in the game
        #      (e.g. via attack) and being created/destroyed in the cycle
        #      of region/map loading/unloading. weakref is probably still
        #      useful, but the terminaology and use of the different cases
        #      needs to be clear
        obj.signals.destroy.connect(self.on_destroy)

    def on_destroy(self, *args):
        self.locked = False


class Door(Base):

    def init(self, rectangle, destination, locks=None, switches=None):

        self.body = Body(*rectangle)
        self.destination = destination

        # TODO resolve this tile width/height crap
        pos = (rectangle.x * 32, rectangle.y * 32)
        size = (rectangle.w * 32, rectangle.h * 32)
        self.widget = DoorWidget(pos=pos, size=size)

        self._locks = set()
        self.generic_lock = Lock()

        if locks is not None:
            for key in locks:
                # TODO better Tiled interface for this stuff
                if key == 'generic':
                    self._locks.add(self.generic_lock)
                else:
                    obj = self.objects[key]
                    lock = ObjectLock(obj)
                    self._locks.add(lock)

        if switches is not None:
            for switch in switches:
                obj = self.objects[switch]
                lock = SwitchLock(obj)
                self._locks.add(lock)

        # TODO something to connect these kind of signals automatically
        self.signals.player_collision.connect(self.on_player_collision)

    @property
    def locked(self):
        return any(lock.locked for lock in self._locks)

    def update(self, dt):
        for lock in self._locks:
            lock.update(dt)

        self.widget.locked = self.locked


    def on_player_collision(self, player):
        if (self.generic_lock in self._locks and self.generic_lock.locked
            and player.keys.balance > 0):

            player.keys.balance -= 1
            self.generic_lock.locked = False

        if not self.locked:
            self.app.load_scene(self.destination)

    def init_from_config(self, config):
        try:
            locks = re.split(', *', config.locks)
        except AttributeError:
            locks = None

        try:
            switches = re.split(', *', config.switches)
        except AttributeError:
            switches = None

        self.init(config.rectangle, config.Destination, locks=locks,
                  switches=switches)
