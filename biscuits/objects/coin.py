from biscuits.objects.basic import Basic

class Coin(Basic):

    def init(self, *args, **kwargs):
        super().init('coins', *args, **kwargs)

    def init_from_config(self, config):
        self.init(config.rectangle, config.coin_value)
