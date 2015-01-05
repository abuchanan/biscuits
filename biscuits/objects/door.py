from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class DoorWidget(BasicWidget):

    locked_color = (0, 0, 0)
    unlocked_color = (0, 1, 1)

    def __init__(self):
        super().__init__(color=self.unlocked_color)

    def unlocked(self):
        self._kivy_widget.color.rgb = self.unlocked_color

    def locked(self):
        self._kivy_widget.color.rgb = self.locked_color
            

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

    body = Body(is_block=True)
    widget = DoorWidget()

    def __init__(self, destination, locks=None, switches=None):

        self.destination = destination

        self._locks = set()
        self.generic_lock = Lock()

        if locks is not None:
            for key in locks:
                # TODO better Tiled interface for this stuff
                if key == 'generic':
                    self._locks.add(self.generic_lock)
                else:
                    obj = self.scene.objects[key]
                    lock = ObjectLock(obj)
                    self._locks.add(lock)

        if switches is not None:
            for switch in switches:
                obj = self.scene.objects[switch]
                lock = SwitchLock(obj)
                self._locks.add(lock)

    @property
    def locked(self):
        return any(lock.locked for lock in self._locks)

    def on_update(self, dt):
        # TODO here's where I need a multi-level object/component tree
        for lock in self._locks:
            lock.update(dt)

        if self.locked:
            self.widget.locked()
        else:
            self.widget.unlocked()


    def on_player_collision(self, player):
        if (self.generic_lock in self._locks and self.generic_lock.locked
            and player.keys.balance > 0):

            player.keys.balance -= 1
            self.generic_lock.locked = False

        if not self.locked:
            self.scene.load_scene(self.destination)
