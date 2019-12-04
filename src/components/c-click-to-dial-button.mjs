import { Logger } from '../lib/logging.mjs';
import browser from '/vendor/browser-polyfill.js';

const logger = new Logger('click-to-dial-button');
const phoneIconClassName = 'vialer-icon';

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
      height: 18px;
      line-height: 18px;
      margin: 0 4px;
      padding: 0;
      position: relative;
      width: 18px;
`;

const template = document.createElement('template');
template.innerHTML = `
<button data-selector="click-to-dial-button" style="${buttonStyle}"></button>
`;

window.customElements.define(
  'c-click-to-dial-button',

  class extends HTMLElement {
    connectedCallback() {
      this.appendChild(template.content.cloneNode(true));
      this.callButton = this.querySelector('[data-selector=click-to-dial-button]');
      this.callButton.addEventListener('click', this);
      this.callButton.className = phoneIconClassName;
    }

    disconnectedCallback() {
      this.callButton.removeEventListener('click', this);
    }

    async handleEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (this.phoneNumber) {
        browser.runtime.sendMessage(null, { b_number: this.phoneNumber }).then(() => {
          logger.info(`Trying to call ${this.phoneNumber}`);
        });
      }
    }

    set contactDetails(number) {
      this.phoneNumber = number;
    }

    get contactDetails() {
      return this.phoneNumber;
    }
  }
);
