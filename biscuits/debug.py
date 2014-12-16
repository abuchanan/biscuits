from kivy.clock import Clock
from kivy.graphics import *
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label


class DebugWidget(BoxLayout):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        with self.canvas.before:
            PushState('color')
            Color(0, 0, 0, 1)
            self.rect = Rectangle(size=self.size, pos=self.pos)
            PopState('color')

        self.label = Label(text='FPS: ')
        self.add_widget(self.label)
        self.bind(pos=self.update, size=self.update)
        Clock.schedule_interval(self.update, .1)

    def update(self, *args):
        self.rect.size = self.size
        self.rect.pos = self.pos
        self.label.text = 'FPS: ' + str(int(Clock.get_fps()))
