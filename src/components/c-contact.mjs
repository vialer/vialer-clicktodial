import { show, hide, loadTemplate } from '/utils/dom.mjs';
import browser from '/vendor/browser-polyfill.js';
import { processSearchProperties } from '/utils/processSearchProperties.mjs';
import * as segment from '../lib/segment.mjs';
import { Logger } from '../lib/logging.mjs';

const logger = new Logger('contact');

loadTemplate('c-contact').then(({ content }) => {
  customElements.define(
    'c-contact',

    class Contact extends HTMLElement {
      set contactDetails(data) {
        this.phoneNumber = data.phoneNumber;

        this.phoneNumberNode.innerText = data.phoneNumber;
        this.nameNode.innerText = data.description;

        this.searchProperties = processSearchProperties(data);
      }

      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.nameNode = this.querySelector('[data-selector=name]');
        this.phoneNumberNode = this.querySelector('[data-selector=phoneNumber]');
        this.callButton = this.querySelector('[data-selector=call-me]');
        this.callButton.addEventListener('click', this);

        window.addEventListener('availabilityChange', e => {
          this.changeVisibilityCallButton(e.detail.disabled);
        });
      }

      changeVisibilityCallButton(isDisabled) {
        if (isDisabled) {
          hide(this.callButton);
        } else {
          show(this.callButton);
        }
      }

      disconnectedCallback() {
        this.callButton.removeEventListener('click', this);
      }

      async handleEvent({ type }) {
        if (this.phoneNumber) {
          browser.runtime.sendMessage(null, { b_number: this.phoneNumber }).then(() => {
            logger.info(`Trying to call ${this.phoneNumber}`);
          });
          segment.track.callContact();
        }
      }

      doesMatchSearchString(_str = '') {
        if (0 === _str.length) {
          return true;
        }
        const str = _str.toLowerCase();
        for (const searchProperty of this.searchProperties) {
          if (searchProperty.includes(str)) {
            return true;
          }
        }
        return false;
      }
    }
  );
});
