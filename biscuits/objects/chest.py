from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body


class Chest(Base):

    def init(self, rectangle):

        # TODO resolve this tile width/height crap
        self.widget = BasicWidget(pos=(rectangle.x * 32, rectangle.y * 32),
                                  size=(32, 32))
        self.widget.color.rgb = (0, 0, 1)
        self.body = Body(*rectangle, is_block=True)
        self.is_open = False

        self.signals.use.connect(self.on_use)

    def init_from_config(self, config):
        self.init(config.rectangle)

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

    def init(self, rectangle, value=1):
        super().init(rectangle)
        self.value = value

    def init_from_config(self, config):
        self.init(config.rectangle, value=config.coin_value)

    def on_chest_opened(self, player):
        player.coins.balance += self.value
