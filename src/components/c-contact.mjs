import { clickToDial } from '/lib/data.mjs';
import { show, hide, loadTemplate } from '/lib/dom.mjs';
import { showNotification } from '/lib/notify.mjs';

import { processSearchProperties } from '/utils/processSearchProperties.mjs';

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

            async handleEvent(e) {
                if (this.phoneNumber) {
                    let { b_number } = await clickToDial(this.phoneNumber);
                    showNotification(`calling ${b_number}`);
                }
            }

            set contactDetails(cDetail) {
                let detail = document.createElement('div');
                this.phoneNumber = cDetail.phoneNumber;
                // this.detail = this.querySelector("#contact");
                //TODO dit veranderen -> niet appenden in de set functie, beter in connectedCallback
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
