from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Door(Base):

    def __init__(self, rectangle, destination):
        super().__init__()

        self.body = Body(*rectangle, is_block=True)
        self.destination = destination

        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(rectangle.w * 32, rectangle.h * 32))
        self.widget.color.rgb = (0, 1, 1)

        self.signals.player_collision.connect(self.on_player_collision)

    def on_player_collision(self, player):
        self.signals.load_scene.send(self.destination)


    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle, config.Destination)
