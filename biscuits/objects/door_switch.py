from kivy.core.audio import SoundLoader
from kivy.properties import BooleanProperty

from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class DoorSwitchWidget(BasicWidget):

    switch_active = BooleanProperty(False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.color.rgb = (0.1, 0.1, 0.1)
        self.bind(switch_active=self.redraw)
        self.sound = SoundLoader.load('media/sounds/blocks-moving.wav')

    def redraw(self, *args, **kwargs):
        if self.switch_active:
            self.color.rgb = (0.5, 0.5, 0.5)
            self.sound.play()
        else:
            self.color.rgb = (0.1, 0.1, 0.1)


class DoorSwitch(Base):

    def init(self, rectangle):

        self.body = Body(*rectangle)

        # TODO resolve this tile width/height crap
        pos = (rectangle.x * 32, rectangle.y * 32)
        size = (rectangle.w * 32, rectangle.h * 32)
        self.widget = DoorSwitchWidget(pos=pos, size=size)
        self.active = False

        self.signals.player_collision.connect(self.on_player_collision)

    def on_player_collision(self, player):
        if not self.active:
            self.active = True
            self.widget.switch_active = True
            self.signals.switch_active.send()

    def init_from_config(self, config):
        self.init(config.rectangle)
