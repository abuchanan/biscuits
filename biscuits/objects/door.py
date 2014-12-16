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

    def __init__(self, rectangle, destination, locks=None):
        super().__init__()

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

        self.signals.player_collision.connect(self.on_player_collision)

    def add_lock(self, name):
        self._lock.append(name)
        self.widget.locked = True

    def remove_lock(self, name):
        try:
            self._lock.remove(name)
        except ValueError:
            pass

        if not self._locks:
            self.widget.locked = False

    def on_player_collision(self, player):
        if 'generic' in self._locks and player.keys.balance > 0:
            player.keys.balance -= 1
            self._locks.remove('generic')

        if not self._locks:
            self.signals.load_scene.send(self.destination)

    @classmethod
    def from_config(cls, config):
        locks = getattr(config, 'locks', '').split()
        return cls(config.rectangle, config.Destination, locks=locks)
