import { clickToDial } from '/lib/data.mjs';
import { show, hide, loadTemplate } from '/lib/dom.mjs';
import { showNotification } from '/lib/notify.mjs';

import { processSearchProperties } from '/utils/processSearchProperties.mjs';
import * as segment from '/lib/segment.mjs';

loadTemplate('c-contact').then(({ content }) => {
    customElements.define('c-contact',

        class Contact extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                this.callButton = this.querySelector('[data-selector=call-me]');
                this.callButton.addEventListener('click', this);
                window.addEventListener('availabilityChange', (e) => {
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

            set contactDetails(cDetail) {
                let detail = document.createElement('div');
                this.phoneNumber = cDetail.phoneNumber;
                detail.innerHTML = cDetail.description + "\n" + cDetail.phoneNumber;
                this.searchProperties = processSearchProperties(cDetail);
                this.appendChild(detail);
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
})
