import '/components/c-toggle-availability.mjs';

import { empty, disable, enable, select, loadTemplate } from '/utils/dom.mjs';
import { getDestinations, getSelectedDestination, setDestination } from '/lib/data.mjs';
import { Logger } from '/lib/logging.mjs';
import * as segment from '/lib/segment.mjs';


const logger = new Logger('availability');

loadTemplate('c-availability').then(({ content }) => {

    window.customElements.define('c-availability',

        class extends HTMLElement {
            constructor() {
                super();
            }

            async connectedCallback() {
                this.appendChild(content.cloneNode(true));
                logger.info("Component mounted");

                window.addEventListener('availabilityChange', () => {
                    this.changeAvailability();
                });

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

                this.getSavedDestination().then((prevDestination) => {
                    this.destinations.forEach(destination => {
                        const option = document.createElement('option');
                        option.value = destination.id;
                        option.textContent = destination.description;
                        if (
                            this.selectedDestination &&
                            (this.selectedDestination.phoneaccount == destination.id ||
                                this.selectedDestination.userdestination == destination.id)
                        ) {
                            select(option);
                            this.checkBox.previousAvailability = destination;

                        } else if (this.selectedDestination.phoneaccount === null &&
                            prevDestination !== undefined && destination.id === prevDestination.id) {
                            select(option);
                            this.checkBox.previousAvailability = destination;
                        }
                        this.destinationSelectNode.appendChild(option);
                    });
                })
            }

            changeAvailability() {
                if (this.checkBox.isDisabled) {
                    disable(this.destinationSelectNode);
                } else {
                    enable(this.destinationSelectNode);
                }
            }

            async setCheckbox() {
                this.togglePlace = this.querySelector('[data-selector=place-toggle]');
                this.checkBox = document.createElement("c-toggle-availability");
                this.togglePlace.appendChild(this.checkBox);
                this.checkBox.isDisabled = this.isPhoneDisabled;
            }

            async getSavedDestination() {
                let previousDestination = await browser.storage.local.get('previousAvailability');
                return previousDestination['previousAvailability'];
            }

            disconnectedCallback() {
                this.destinationSelectNode.removeEventListener('change', this);
            }

            async handleEvent({ type, currentTarget, target: { value } }) {
                if ('change' === type && currentTarget === this.destinationSelectNode) {
                    segment.track.updateAvailability();
                    const destination = this.destinations.find(destination => destination.id == value);
                    this.checkBox.previousAvailability = destination;
                    await setDestination(destination);
                }
            }
        }
    );
})
