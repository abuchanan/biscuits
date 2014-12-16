from kivy.graphics import *
from kivy.properties import NumericProperty
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label


class HUDWidget(BoxLayout):

    coins = NumericProperty(0)
    keys = NumericProperty(0)
    health = NumericProperty(0)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with self.canvas.before:
            PushState('color')
            Color(0, 0, 0, 1)
            self.rect = Rectangle(size=self.size, pos=self.pos)
            PopState('color')

        self.health_label = Label(text='Health: ' + str(self.health))
        self.bind(health=self.redraw)
        self.add_widget(self.health_label)

        self.coins_label = Label(text='Coins: ' + str(self.coins))
        self.bind(coins=self.redraw)
        self.add_widget(self.coins_label)

        self.keys_label = Label(text='Keys: ' + str(self.keys))
        self.bind(keys=self.redraw)
        self.add_widget(self.keys_label)

        self.bind(pos=self.redraw, size=self.redraw)

    def redraw(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.coins_label.text = 'Coins: ' + str(self.coins)
        self.health_label.text = 'Health: ' + str(self.health)
        self.keys_label.text = 'Keys: ' + str(self.keys)
