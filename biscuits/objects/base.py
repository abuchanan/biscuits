from collections import OrderedDict
import inspect
from types import SimpleNamespace

from biscuits.signals import Signals


class Config:
    def __init__(self, **kwargs):
        object.__setattr__(self, '_data', dict(**kwargs))

    def items(self):
        return self._data.items()

    def __getattr__(self, key):
        try:
            return self._data[key]
        except KeyError:
            raise AttributeError

    def __setattr__(self, key, value):
        self._data[key] = value


class ConfigError(Exception): pass
class ComponentInitError(Exception): pass

class ComponentTemplate:

    def __init__(self, cls, components, *args, **kwargs):
        self._cls = cls
        self._components = components
        self._args = args
        self._kwargs = kwargs


    @classmethod
    def from_component(cls, component, *args, **kwargs):
        components = OrderedDict(component.components.items())
        return cls(component, components, *args, **kwargs)


    def config(self, config):
        components = OrderedDict(self._components.items())
        args = tuple(self._args)
        kwargs = dict(self._kwargs)

        for key, value in config.items():

            if isinstance(value, Config):
                try:
                    component = components[key]
                except KeyError:
                    pass
                else:
                    components[key] = component.config(value)

            else:
                kwargs[key] = value

        return ComponentTemplate(self._cls, components, *args, **kwargs)


    def _set_parent(self, obj, parent):
        # TODO this creates a circular reference that breaks GC
        obj.parent = parent

        try:
            setattr(obj, obj.parent_name, parent)
        except AttributeError:
            pass


    def _bind_init_args(self, args, kwargs):

        # Get the signature of the component's __init__ method
        try:
            init_sig = inspect.signature(self._cls.__init__)
        except TypeError:
            init_sig = inspect.Signature()

        # Only bind kwargs that are in the signature. This allows the config
        # to have extra information without raising an error on component init.
        keys = kwargs.keys() & init_sig.parameters.keys()
        kwargs_to_bind = dict((k, kwargs[k]) for k in keys)

        # Satisfy the "self" argument
        args_to_bind = (None,) + args

        try:
            init_sig.bind(*args_to_bind, **kwargs_to_bind)
        except TypeError as e:
            msg = 'while configuring {}: {}'
            msg = msg.format(self._cls.__name__, e)
            raise ConfigError(msg) from None
        else:
            return args, kwargs_to_bind
        

    def attach(self, parent):
        args, kwargs = self._bind_init_args(self._args, self._kwargs)

        result = self._cls._create()
        self._set_parent(result, parent)

        result._pre_init(*self._args, **self._kwargs)

        for key, value in self._components.items():
            component = value.attach(result)
            setattr(result, key, component)

        try:
            result.__init__(*args, **kwargs)
        except Exception as e:
            # TODO do some intelligent checking here to provide nice error
            #      message when components are defined out of order

            # AND/OR don't store templates on class, so that error describes
            #        *missing* attribute, instead of wrong type
            raise ComponentInitError(self._cls.__name__) from e

        return result


class LastUpdatedOrderedDict(OrderedDict):
    'Store items in the order the keys were last added'

    def __setitem__(self, key, value):
        if key in self:
            del self[key]
        OrderedDict.__setitem__(self, key, value)


class ComponentMeta(type):

    @classmethod
    def __prepare__(metacls, name, bases, **kwds):
        return OrderedDict()

    def __new__(cls, name, bases, namespace, **kwds):
        components = LastUpdatedOrderedDict()

        for base in bases:
            components.update(base.components)

        for key, value in namespace.items():
            if isinstance(value, ComponentTemplate):
                del namespace[key]
                components[key] = value

        result = type.__new__(cls, name, bases, dict(namespace))
        result.components = components

        return result


class Component(metaclass=ComponentMeta):

    template_class = ComponentTemplate

    def __new__(cls, *args, **kwargs):
        return cls.template_class.from_component(cls, *args, **kwargs)

    @classmethod
    def _create(cls):
        return super(Component, cls).__new__(cls)

    def _pre_init(self, *args, **kwargs):
        self.signals = Signals()
        parent_signals = getattr(self.parent, 'signals', None)

        # Bind signal handlers matching "on_*" naming convention
        for key, value in inspect.getmembers(self):
            if key.startswith('on_'):
                signal_name = key[3:]
                self.signals[signal_name].connect(value)

                if parent_signals:
                    parent_signals[signal_name].connect(value)

        try:
            self.scene = self.parent.scene
        except AttributeError:
            pass


class Base(Component):
    parent_name = 'scene'
