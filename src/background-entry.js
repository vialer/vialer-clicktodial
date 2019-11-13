import { clickToDial } from './lib/data.mjs';
import { showNotification } from './lib/notify.mjs';
import { Logger } from './lib/logging.mjs';

// import 'webextension-polyfill';
// import * as segment from './lib/segment.mjs';
// import { startTrackingUser } from './utils/startTrackingUser.mjs';

// startTrackingUser();
const logger = new Logger('background');


chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.b_number) {
        clickToDial(request.b_number).then(({ b_number }) => {
            showNotification(`calling ${b_number}`);
            sendResponse({ update: 'Trying to make the call' });
        }).catch((e)=>{
            logger.error(e);
        })
        //TODO notificatie als er error status code terugkomt
    }
});
