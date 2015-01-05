from biscuits.objects.base import Component


class Bank(Component):

    def __init__(self, initial=0):
        self._balance = initial

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, val):
        self._balance = max(val, 0)
