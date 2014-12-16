from kivy.graphics import *
from kivy.uix.widget import Widget

from biscuits.objects.base import Base
from biscuits.World import Body


class BasicWidget(Widget):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.size_hint = (None, None)

        with self.canvas:
            PushState('color')
            self.color = Color(1, 0, 0)
            self.rect = Rectangle(pos=self.pos, size=self.size)
            PopState('color')


class Basic(Base):

    def __init__(self, name, rectangle, value=1):
        super().__init__()

        self.name = name
        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(32, 32))
        self.body = Body(*rectangle)
        self.value = value

        self.signals.player_collision.connect(self.on_player_collision)

    def on_player_collision(self, player):
        getattr(player, self.name).balance += self.value
        self.destroy()
