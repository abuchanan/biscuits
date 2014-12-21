from biscuits.objects.basic import Basic

class Key(Basic):

    def init(self, *args, **kwargs):
        super().init('keys', *args, **kwargs)
        self.widget.color.rgb = (1, 1, 0)

    def init_from_config(self, config):
        self.init(config.rectangle)
