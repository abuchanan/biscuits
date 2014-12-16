from biscuits.objects.basic import Basic

class Coin(Basic):

    def __init__(self, *args, **kwargs):
        super().__init__('coins', *args, **kwargs)

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle, config.coin_value)
