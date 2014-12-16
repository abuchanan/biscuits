from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Chest(Base):

    def __init__(self, rectangle):
        super().__init__()

        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(32, 32))
        self.widget.color.rgb = (0, 0, 1)
        self.body = Body(*rectangle, is_block=True)
        self.is_open = False

        self.signals.use.connect(self.on_use)

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle)

    def on_use(self, player):
        if not self.is_open:
            self.is_open = True
            self.widget.color.rgb = (0, 0, 0)
            self.on_chest_opened(player)

    def on_chest_opened(self, player):
        """
        Called when the chest is opened, i.e. this is only called once, when
        the chest receives the first "use" signal.

        This should be implemented in subclasses (see CoinChest).
        """
        pass


class CoinChest(Chest):

    def __init__(self, rectangle, value=1):
        super().__init__(rectangle)
        self.value = value

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle, value=config.coin_value)

    def on_chest_opened(self, player):
        player.coins.balance += self.value
