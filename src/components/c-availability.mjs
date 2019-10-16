import '/components/c-toggle-availability.mjs';

import { empty } from '/lib/dom.mjs';
import { getDestinations, getSelectedDestination, setDestination } from '/lib/data.mjs';

const template = document.createElement('template');
template.innerHTML = `
<span data-selector="place-toggle"><h3>Availability</h3></span>
<div data-selector="availability">
<select data-selector="destination-select"></select>
</div>
`;

window.customElements.define('c-availability',

    class extends HTMLElement {
        constructor() {
            super();
        }

        async connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");

            window.addEventListener('availabilityChange', () => {
                this.changeAvailability();
            });

            this.availability = this.querySelector('[data-selector=availability]');

            this.destinations = [];

            const destinations = await getDestinations(true);
            this.destinations.push(...destinations);

            this.destinationSelectNode = this.querySelector('[data-selector=destination-select]');
            this.destinationSelectNode.addEventListener('change', this);

            getSelectedDestination().then((selected) => {
                this.selectedDestination = selected;
                this.isPhoneDisabled = this.selectedDestination.phoneaccount === null ? true : false;
                this.setCheckbox();
                this.updateSelectedDestination();
                this.changeAvailability();
            });
        }

        async updateSelectedDestination() {

            empty(this.destinationSelectNode);

            this.destinations.forEach(destination => {
                const option = document.createElement('option');
                option.value = destination.id;
                option.textContent = destination.description;

                if (
                    this.selectedDestination &&
                    (this.selectedDestination.phoneaccount == destination.id ||
                        this.selectedDestination.userdestination == destination.id)
                ) {
                    option.setAttribute('selected', '');
                    this.checkBox.previousAvailability = option;
                }
                this.destinationSelectNode.appendChild(option);
            });
        }

        changeAvailability() {
            if (this.checkBox.isDisabled) {
                this.destinationSelectNode.setAttribute('disabled', '');
            } else {
                this.destinationSelectNode.removeAttribute('disabled');
            }
        }

        setCheckbox() {
            this.togglePlace = this.querySelector('[data-selector=place-toggle]');
            this.checkBox = document.createElement("c-toggle-availability");
            this.togglePlace.appendChild(this.checkBox);
            this.checkBox.isDisabled = this.isPhoneDisabled;
            // for now get the first destination as a default;
            this.checkBox.previousAvailability = this.destinations[0];
        }

        async disconnectedCallback() {
            this.destinationSelectNode.removeEventListener('change', this);
            window.removeEventListener('availabilityChange');
        }

        async handleEvent({ type, currentTarget, target: { value } }) {
            if ('change' === type && currentTarget === this.destinationSelectNode) {
                const destination = this.destinations.find(destination => destination.id == value);
                this.checkBox.previousAvailability = destination;
                await setDestination(destination);
            }
        }
    }
);
