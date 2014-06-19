import {TransientScope} from 'di';
// TODO the difference between this and curly braces is far too subtle.
import EventEmitterLib from 'lib/EventEmitter';
// TODO EventEmitter lies on the critical path of a few systems
//      yet it looks like it's inefficient

export {EventEmitter};

@TransientScope
class EventEmitter extends EventEmitterLib {}
