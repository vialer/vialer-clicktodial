import { clickToDial } from './lib/data.mjs';
import { showNotification } from './lib/notify.mjs';
import * as segment from './lib/segment.mjs';

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
    if (request.b_number) {
        let { b_number } = await clickToDial(request.b_number);
        if (b_number) {
            segment.track.clickedToDial();
            showNotification(`calling ${b_number}`);
            sendResponse({ update: 'Trying to make the call' });
        }
    }
});
