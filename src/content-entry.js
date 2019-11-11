import '@webcomponents/custom-elements';
import * as jQuery from 'jquery';
import { ObserverModule } from './parser/observer.js';

var observer = new ObserverModule();

observer.processPage();
