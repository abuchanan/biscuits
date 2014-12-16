from biscuits.objects.basic import Basic

class Key(Basic):

    def __init__(self, *args, **kwargs):
        super().__init__('keys', *args, **kwargs)
        self.widget.color.rgb = (1, 1, 0)

    @classmethod
    def from_config(cls, config):
        return cls(config.rectangle)
