import browser from '/vendor/browser-polyfill.js';
import { Logger } from '../lib/logging.mjs';
import * as segment from '../lib/segment.mjs';

const logger = new Logger('createClickButton');

const buttonStyle = `
-moz-border-radius: 9px;
-moz-box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.2);
background-image: url('${browser.runtime.getURL('icons/phone.png')}');
background-color: transparent;
background-position: center center;
background-repeat: no-repeat;
cursor: pointer;
border-radius: 9px;
bottom: -3px;
box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.2);
display: inline-block;
height: 18px;wearespindle.com
line-height: 18px;
margin: 0 4px;
padding: 0;
position: relative;
width: 18px;
`;

export function createClickToDialButton(number) {
  const button = document.createElement('button');
  button.setAttribute('style', buttonStyle);
  button.setAttribute('data-number', number);
  button.addEventListener(
    'click',
    () => {
      if (number) {
        browser.runtime.sendMessage(null, { b_number: number }).then(() => {
          logger.info(`Trying to call ${number}`);
          segment.track.clickedToDial();
        });
      }
    },
    true
  );
  return button;
}
