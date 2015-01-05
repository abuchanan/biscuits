from kivy.core.audio import SoundLoader
from kivy.properties import BooleanProperty

from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class DoorSwitchWidget(BasicWidget):

    active_color = (.5, .5, .5)
    inactive_color = (.1, .1, .1)

    def __init__(self, *args, **kwargs):
        super().__init__(color=self.inactive_color)
        self.sound = SoundLoader.load('media/sounds/blocks-moving.wav')

    def activate(self):
        self._kivy_widget.color.rgb = self.active_color
        self.sound.play()


class DoorSwitch(Base):

    body = Body()
    widget = DoorSwitchWidget()

    def __init__(self):
        self.active = False

    def on_player_collision(self, player):
        if not self.active:
            self.active = True
            self.widget.activate()
            self.signals.switch_active.send()
