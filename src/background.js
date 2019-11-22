import { clickToDial } from './lib/data.mjs';
import { showNotification } from './lib/notify.mjs';
import { Logger } from './lib/logging.mjs';
import browser from '/vendor/browser-polyfill.js';
import * as segment from './lib/segment.mjs';

const logger = new Logger('background');

browser.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.b_number) {
    clickToDial(request.b_number)
      .then(({ b_number }) => {
        showNotification(`calling ${b_number}`);
        segment.track.clickedToDial();
      })
      .catch(e => {
        logger.error(e);
      });
  }
});
