from blinker import Signal

class Foo:

    def __init__(self):
        self.on_hit = Signal()
        self.on_hit.connect(self.handle_hit)
        self.on_hit.connect(self.handle_again)

    def handle_hit(self, *args):
        print('hit!', self, args)

    def handle_again(self, *args):
        print('hit again!', self, args)


foo1 = Foo()
foo2 = Foo()

foo1.on_hit.send(1)
foo2.on_hit.send(2)
