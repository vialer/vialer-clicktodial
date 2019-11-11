import { disable, enable, loadTemplate } from '../utils/dom.mjs';
import { clickToDial } from '../lib/data.mjs';
import { Logger } from '../lib/logging.mjs';
import { showNotification } from '../lib/notify.mjs';
import * as segment from '../lib/segment.mjs';

const logger = new Logger('click-to-dial-button');
const phoneIconClassName = 'vialer-icon'

const template = document.createElement('template');
template.innerHTML = `
<button data-selector="click-to-dial-button">
knop
<c-icon icon="phone"></c-icon>
</button>
`;

window.customElements.define('c-click-to-dial-button',

    class extends HTMLElement {
        constructor() {
            super();
        }

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
            e.preventDefault()
            e.stopPropagation()
            e.stopImmediatePropagation()

            if (this.phoneNumber) {
                let { b_number } = await clickToDial(this.phoneNumber);
                showNotification(`calling ${b_number}`);
                // TODO track clicktodial ding
                // segment.track.callContact();
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
