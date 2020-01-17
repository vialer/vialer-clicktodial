import browser from '/vendor/browser-polyfill.js';

const BRAND = '%%BRAND_NAME%%';

export function showNotification(title, options) {
  var options = {
    silent: true
  };
  browser.notifications.create(options, {
    title: `${BRAND}`,
    message: `${title}`,
    type: 'basic'
  });
}
