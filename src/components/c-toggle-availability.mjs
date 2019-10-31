import { setDestination } from '/lib/data.mjs';
import { loadTemplate } from '/lib/dom.mjs';
import * as segment from '/lib/segment.mjs';

loadTemplate('c-toggle-availability').then(({ content }) => {
    window.customElements.define('c-toggle-availability',

        class extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                this.checkbox = this.querySelector('[data-selector=dnd-checkbox]');
                this.checkbox.addEventListener('change', this);
                this.isDisabled = false;
            }

            async disconnectedCallback() {
                this.checkbox.removeEventListener('change', this);
            }

            async handleEvent({ currentTarget: { checked } }) {
                segment.track.toggleDnd();
                if (checked) {
                    setDestination(undefined).then(() => {
                        this.isDisabled = true;
                        window.dispatchEvent(new CustomEvent('availabilityChange', { detail: { disabled: true } }));
                    });
                } else {
                    setDestination(this._previousAvailability).then(() => {
                        this.isDisabled = false;
                        window.dispatchEvent(new CustomEvent('availabilityChange', { detail: { disabled: false } }));
                    });
                }
            }

            set previousAvailability(destination) {
                this._previousAvailability = destination;
            }

            set isDisabled(isDisabled) {
                this._isDisabled = isDisabled;
                this.checkbox.checked = this._isDisabled;
                this.storePreviousAvailability();
            }

            get isDisabled() {
                return this._isDisabled;
            }

            async storePreviousAvailability() {
                await browser.storage.local.set({ 'previousAvailability': this._previousAvailability });
            }
        }
    );
})
