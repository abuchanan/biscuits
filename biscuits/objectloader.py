# TODO automatic search + loading
from biscuits.objects.chest import Chest, CoinChest
from biscuits.objects.coin import Coin
from biscuits.objects.door import Door
from biscuits.objects.door_switch import DoorSwitch
from biscuits.objects.jar import Jar
from biscuits.objects.key import Key
from biscuits.objects.squirrel import Squirrel
from biscuits.objects.boss_squirrel import BossSquirrel
from biscuits.objects.wall import Wall
from biscuits.objects.zombie import Zombie
from biscuits.player import Player


class UnknownObjectType(Exception): pass

# TODO maybe object loader should be the owner of all objects and return
#      only weak references. 
class ObjectLoader:

    _types = {
        'Chest': Chest(),
        'CoinChest': CoinChest(),
        'Coin': Coin(),
        'Door': Door(),
        'DoorSwitch': DoorSwitch(),
        'Jar': Jar(),
        'Key': Key(),
        'Squirrel': Squirrel(),
        'BossSquirrel': BossSquirrel(),
        'Wall': Wall(),
        'Zombie': Zombie(),
        'Player': Player(),
    }

    def __init__(self, configs, scene):
        self.configs = configs
        self.scene = scene
        self.cache = {}

    def __getitem__(self, ID):
        return self.load(ID)

    def load(self, ID):
        try:
            return self.cache[ID]
        except KeyError:
            pass

        config = self.configs[ID]

        try:
            tpl = self._types[config.type]
        except KeyError:
            raise UnknownObjectType('Unknown object type: {}'.format(config.type))
        else:
            obj = tpl.config(config).attach(self.scene)
            self.cache[ID] = obj
            return obj
