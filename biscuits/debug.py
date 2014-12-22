from kivy.clock import Clock
from kivy.graphics import *
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label


class DebugWidget(BoxLayout):

    def __init__(self, player, **kwargs):
        super().__init__(**kwargs)
        self.player = player

        with self.canvas.before:
            PushState('color')
            Color(0, 0, 0, 1)
            self.rect = Rectangle(size=self.size, pos=self.pos)
            PopState('color')

        self.label = Label(text='FPS: ')
        self.add_widget(self.label)
        self.bind(pos=self.update, size=self.update)

        button = Button(text='Kill player')
        button.bind(on_press=self.kill_player)
        self.add_widget(button)

        Clock.schedule_interval(self.update, .1)

    def kill_player(self, *args):
        self.player.health.balance = 0

    def update(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.label.text = 'FPS: ' + str(int(Clock.get_fps()))
