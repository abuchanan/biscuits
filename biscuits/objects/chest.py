from biscuits.objects.base import Base
from biscuits.objects.basic import BasicWidget
from biscuits.World import Body



class ChestWidget(BasicWidget):

    closed_color = (0, 0, 1)
    opened_color = (0, 0, 0)

    def __init__(self):
        super().__init__(color=self.closed_color)

    def opened(self):
        self._kivy_widget.color.rgb = self.opened_color


class Chest(Base):

    body = Body(is_block=True)
    widget = ChestWidget()

    def __init__(self):
        self.is_open = False

    def on_use(self, player):
        if not self.is_open:
            self.is_open = True
            self.widget.opened()
            self.on_chest_opened(player)

    def on_chest_opened(self, player):
        """
        Called when the chest is opened, i.e. this is only called once, when
        the chest receives the first "use" signal.

        This should be implemented in subclasses (see CoinChest).
        """
        pass


class CoinChest(Chest):

    def __init__(self, value=1):
        self.value = value

    def on_chest_opened(self, player):
        player.coins.balance += self.value
