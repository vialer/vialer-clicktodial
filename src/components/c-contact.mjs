import { clickToDial } from '/lib/data.mjs';
import { show, hide, isHidden } from '/lib/dom.mjs';
import { showNotification } from '/lib/notify.mjs';


import replaceSpecialCharacters from '/utils/replaceSpecialCharacters.mjs';

const template = document.createElement('template');
template.innerHTML = `
<div id="contact">
<button id="call-me">bel</button>
</div>
`;

const searchTheseProperties = ['description', 'phoneNumber'];

function processSearchProperties(data) {
    return searchTheseProperties.reduce((prev, property) => {
        if (property in data) {
            prev.push(`${data[property]}`.toLowerCase());
            prev.push(replaceSpecialCharacters(data[property]).toLowerCase());
        }
        return prev;
    }, []);
}

customElements.define('c-contact',

    class Contact extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            this.callButton = this.querySelector("#call-me");
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
