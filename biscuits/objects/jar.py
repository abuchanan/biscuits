from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Jar(Base):

    body = Body(is_block=True)
    widget = BasicWidget(color=(.5, .25, 0))

    def on_attacked(self, attacker):
        self.destroy()
