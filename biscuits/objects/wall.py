from biscuits.objects.base import Base
from biscuits.World import Body


class Wall(Base):
    body = Body(is_block=True)
