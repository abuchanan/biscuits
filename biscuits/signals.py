from blinker import Signal

class Signals:

    # TODO this is inefficient when you want to broadcast an event to all objects
    #      creates lots of unneeded signals objects
    def __getattr__(self, name):
        signal = Signal()
        setattr(self, name, signal)
        return signal
