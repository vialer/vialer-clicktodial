import { show, hide, loadTemplate } from '/utils/dom.mjs';
import browser from '/vendor/browser-polyfill.js';
import { processSearchProperties } from '/utils/processSearchProperties.mjs';
import * as segment from '../lib/segment.mjs';
import { Logger } from '../lib/logging.mjs';

const logger = new Logger('queue');

loadTemplate('c-queue').then(({ content }) => {
  customElements.define(
    'c-queue',

    class Queue extends HTMLElement {
      set queueDetails(data) {
        console.log(data);
        this.phoneNumber = data.phoneNumber;

        this.phoneNumberNode.innerText = data.phoneNumber;
        this.nameNode.innerText = data.description;
        this.sizeNode.innerText = data.queueSize;
        console.log(data.status);
        this.sizeNode.classList.add(data.status);
        this.searchProperties = processSearchProperties(data);
      }

      async handleEvent({ type }) {
        if (this.phoneNumber) {
          browser.runtime.sendMessage(null, { b_number: this.phoneNumber }).then(() => {
            logger.info(`Trying to call ${this.phoneNumber}`);
          });
          segment.track.callContact();
        }
      }

      changeVisibilityCallButton(isDisabled) {
        if (isDisabled) {
          hide(this.callButton);
        } else {
          show(this.callButton);
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

      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.nameNode = this.querySelector('[data-selector=name]');
        this.sizeNode = this.querySelector('[data-selector=size]');
        this.phoneNumberNode = this.querySelector('[data-selector=phoneNumber]');
        this.callButton = this.querySelector('[data-selector=call-me]');
        this.callButton.addEventListener('click', this);

        window.addEventListener('availabilityChange', (e) => {
          this.changeVisibilityCallButton(e.detail.disabled);
        });
      }

      disconnectedCallback() {
        this.callButton.removeEventListener('click', this);
      }
    }
  );
});
