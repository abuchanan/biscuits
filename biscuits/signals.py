from blinker import Signal

# TODO explore ChainMap
class Signals:

    # TODO this is inefficient when you want to broadcast an event to all objects
    #      creates lots of unneeded signals object
    def __getattr__(self, name):
        signal = Signal()
        setattr(self, name, signal)
        return signal

    def __getitem__(self, name):
        return getattr(self, name)
