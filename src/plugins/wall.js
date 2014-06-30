import {loader, provideBodyConfig} from 'src/utils';
import {Body} from 'src/world';

export {WallLoader};

var WallLoader = loader([provideBodyConfig], [Body]);
