from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.label import Label


class DeadSceneWidget(AnchorLayout):

    def __init__(self, scene, *args, **kwargs):
        super().__init__(*args, **kwargs)

        container = BoxLayout(orientation='vertical', anchor_x='center',
                              anchor_y='center', size_hint=(.75, .25))
        self.add_widget(container)

        label = Label(text="Dude, you're dead.")
        container.add_widget(label)

        button = Button(text='Start over', height=50, width=200,
                        size_hint=(None, None), pos_hint={'center_x': 0.5})
        button.bind(on_press=lambda *args: scene.start_over())
        container.add_widget(button)


class DeadScene:
    def __init__(self, app):
        self.app = app
        self.widget = DeadSceneWidget(self)

    def start_over(self):
        # TODO reset player
        # TODO reset world/regions?
        self.app.game.player.life.amount = 5
        self.app.load_scene('Loadpoint 1a')

    def update(self, dt):
        pass

    def unload(self):
        pass
