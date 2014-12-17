from kivy.app import App
from kivy.base import EventLoop
from kivy.clock import Clock
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.widget import Widget
from kivy.graphics import *

from biscuits.geometry import Rectangle as Block
from biscuits.pathfinding import QuadTree


class Visualization(Widget):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        a = Block(3, 3, 2, 2)
        b = Block(7, 7, 2, 2)
        blocks = [a, b]

        tree = QuadTree(0, 0, 10, 10, blocks=blocks, minimum_size=0.05)
        scale = 50

        with self.canvas:


            for node in tree.walk_nodes():
                if node.children is None:
                    print(node)
                    Color(1, 1, 1)
                    Rectangle(pos=(node.x * scale, node.y * scale),
                              size=(node.w * scale, node.h * scale))

            for node in tree.walk_nodes():
                Color(1, 0, 0)
                Line(rectangle=(node.x * scale, node.y * scale,
                                node.w * scale, node.h * scale))

            Color(0, 0, 1)

            for block in blocks:
                Rectangle(pos=(block.x * scale, block.y * scale),
                          size=(block.w * scale, block.h * scale))


class App(App):

    def build(self):
        EventLoop.ensure_window()

        vis = Visualization()

        return vis


App().run()
