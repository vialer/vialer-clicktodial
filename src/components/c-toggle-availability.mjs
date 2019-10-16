import { setDestination } from '/lib/data.mjs';

const template = document.createElement('template');
template.innerHTML = `
<label>
    Do not disturb: 
    <input type="checkbox" data-selector="dnd-checkbox" />
</label>
`;

window.customElements.define('c-toggle-availability',

    class extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            this.checkbox = this.querySelector('[data-selector=dnd-checkbox]');
            this.checkbox.addEventListener('change', this);
            this.isDisabled = false;
        }

        async disconnectedCallback() {
            this.checkbox.removeEventListener('change', this);
        }

        async handleEvent({ currentTarget: { checked } }) {
            if (checked) {
                setDestination(undefined).then(() => {
                    this.isDisabled = true;
                    window.dispatchEvent(new CustomEvent('availabilityChange'));
                });
            } else {
                setDestination(this._previousAvailability).then(() => {
                    this.isDisabled = false;
                    window.dispatchEvent(new CustomEvent('availabilityChange'));
                });
            }
        }

        set previousAvailability(destination) {
            this._previousAvailability = destination;
        }

        set isDisabled(isDisabled) {
            this._isDisabled = isDisabled;
            this.checkbox.checked = this._isDisabled;
        }

        get isDisabled() {
            return this._isDisabled;
        }
    }
);