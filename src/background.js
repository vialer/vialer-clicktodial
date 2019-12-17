import browser from '/vendor/browser-polyfill.js';
import { clickToDial } from './lib/data.mjs';
import { showNotification } from './lib/notify.mjs';
import { Logger } from './lib/logging.mjs';
import { translate } from './lib/i18n.mjs';
import cleanPhoneNumber from './utils/cleanPhoneNumber.mjs';

const logger = new Logger('background');

function doClickToDial(number) {
  clickToDial(number)
    .then(({ b_number }) => {
      translate('calling').then(callingMessage => {
        showNotification(`${callingMessage}: ${b_number}`);
      });
      segment.track.clickedToDial();
    })
    .catch(e => {
      logger.error(e);
    });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.b_number) {
    doClickToDial(request.b_number);
  }
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'select-number') {
    const phoneNumber = cleanPhoneNumber(info.selectionText);
    if (phoneNumber) {
      doClickToDial(phoneNumber);
    }
  }
});

translate('call_selected_number').then(title => {
  browser.contextMenus.create({
    id: 'select-number',
    title,
    contexts: ['selection']
  });
});
