import browser from '/vendor/browser-polyfill.js';
import { clickToDial } from './lib/data.mjs';
import { showNotification } from './lib/notify.mjs';
import { Logger } from './lib/logging.mjs';
import { translate } from './lib/i18n.mjs';
import cleanPhoneNumber from './utils/cleanPhoneNumber.mjs';
import * as segment from './lib/segment.mjs';
import debounce from './utils/debounce.mjs';

const logger = new Logger('background');

async function doClickToDial(number) {
  clickToDial(number)
    .then(({ b_number }) => {
      translate('calling').then((callingMessage) => {
        showNotification(`${callingMessage}: ${b_number}`);
      });
      segment.track.clickedToDial();
    })
    .catch((e) => {
      logger.error(e);
    });
}

const debouncedClicktoDial = debounce({ fn: doClickToDial, delay: 3000, immediate: true });

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.b_number) {
    debouncedClicktoDial(request.b_number);
  }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'select-number') {
    const phoneNumber = cleanPhoneNumber(info.selectionText);
    if (phoneNumber) {
      debouncedClicktoDial(phoneNumber);
    }
  }
});

translate('call_selected_number').then((title) => {
  browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: 'select-number',
    title,
    contexts: ['selection'],
  });
});
