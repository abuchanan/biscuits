from biscuits.signals import Signals


class Base:

    def __init__(self, ID, objects):
        self.ID = ID
        self.signals = Signals()
        self.objects = objects

    def destroy(self, *args, **kwargs):
        self.signals.destroy.send(self)

    def update(self, dt):
        pass
