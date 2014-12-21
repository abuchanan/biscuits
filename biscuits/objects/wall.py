from biscuits.objects.base import Base
from biscuits.World import Body


class Wall(Base):

    def init(self, rectangle):
        self.body = Body(*rectangle, is_block=True)

    def init_from_config(self, config):
        self.init(config.rectangle)
