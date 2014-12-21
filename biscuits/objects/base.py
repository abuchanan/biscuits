from biscuits.signals import Signals


# TODO this is an OK solution to sharing scene-wide objects,
#      but I feel like maybe there's something better. Full-on dependency
#      injection is too scary, but maybe there's a pythonic model that
#      I haven't discovered yet.
#
#      For example, what if you wanted to extend the Base to CustomBase?
#
#      For example, this only shares "world" with objects deriving from Base,
#      but it's needed by Body objects too, so BaseSubclass must explicitly
#      pass "self.body" to Body(). Sharing such objects easily is a great
#      benefit of classical DI.
class Base:

    def __init__(self, ID, objects, world):
        self.ID = ID
        self.signals = Signals()
        self.objects = objects
        self.world = world

    def destroy(self, *args, **kwargs):
        self.signals.destroy.send(self)

    def update(self, dt):
        pass
