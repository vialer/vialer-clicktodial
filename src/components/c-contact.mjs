import { clickToDial } from '/lib/data.mjs';
import { show, hide, loadTemplate } from '/utils/dom.mjs';
import { showNotification } from '/lib/notify.mjs';

import { processSearchProperties } from '/utils/processSearchProperties.mjs';
import * as segment from '/lib/segment.mjs';

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
          let { b_number } = await clickToDial(this.phoneNumber);
          showNotification(`calling ${b_number}`);
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
