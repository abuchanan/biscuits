from biscuits.objects.base import Base
from biscuits.World import Body


class Wall(Base):

    def __init__(self, rectangle):
        super().__init__()
        self.body = Body(*rectangle, is_block=True)

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle)
