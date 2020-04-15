import browser from '/vendor/browser-polyfill.js';

const BRAND = '%%BRAND%%';

export function showNotification(title, options) {
  // var options = {
  //   silent: true,
  // };
  browser.notifications.create(options, {
    title: `${BRAND}`,
    message: `${title}`,
    type: 'basic',
    iconUrl: '../brand/logo-16.png',
  });
}
