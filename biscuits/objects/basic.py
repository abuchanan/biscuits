from kivy.graphics import *
from kivy.uix.widget import Widget

from biscuits.objects.base import Base, Component
from biscuits.World import Body


class BasicKivyWidget(Widget):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # TODO get rid of size_hint?
        self.size_hint = (None, None)

        with self.canvas:
            PushState('color')
            self.color = Color(1, 0, 0)
            self.rect = Rectangle(pos=self.pos, size=self.size)
            PopState('color')


class BasicWidget(Component):
    def __init__(self, color):
        # TODO get rid of this hard-coded 32
        bb = self.parent.body.bb
        self._kivy_widget = BasicKivyWidget(pos=(bb.x * 32, bb.y * 32),
                                            size=(32, 32))
        self._kivy_widget.color.rgb = color


class Basic(Base):

    body = Body()

    def __init__(self, value=1):
        self.value = value

    def on_player_collision(self, player):
        getattr(player, self.name).balance += self.value
        self.destroy()
