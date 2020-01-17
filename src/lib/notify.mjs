import browser from '/vendor/browser-polyfill.js';

const BRAND = '%%BRAND_NAME%%';

export function showNotification(title, options) {
  browser.notifications.create({
    title: `${BRAND}`,
    message: `${title}`,
    type: 'basic'
  });
  let notification = new Notification(title, options);
}
