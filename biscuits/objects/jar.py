from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Jar(Base):

    def init(self, rectangle):

        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(32, 32))
        self.widget.color.rgb = (.5, .25, 0)
        self.body = Body(*rectangle, is_block=True)

        self.signals.attack.connect(self.destroy)

    def init_from_config(self, config):
        self.init(config.rectangle)
