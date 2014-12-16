from biscuits.signals import Signals


class Base:

    def __init__(self):
        self.signals = Signals()

    def destroy(self, *args, **kwargs):
        self.signals.destroy.send(self)

    def update(self, dt):
        pass
