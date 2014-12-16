from blinker import Signal

class Signals:

    def __getattr__(self, name):
        signal = Signal()
        setattr(self, name, signal)
        return signal
