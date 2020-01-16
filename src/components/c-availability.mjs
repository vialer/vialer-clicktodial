import browser from '/vendor/browser-polyfill.js';

import { empty, disable, enable, select, loadTemplate } from '/utils/dom.mjs';
import { getDestinations, getSelectedDestination, setDestination, setUnavailable } from '/lib/data.mjs';
import { Logger } from '/lib/logging.mjs';
import * as segment from '/lib/segment.mjs';

const logger = new Logger('availability');

loadTemplate('c-availability').then(({ content }) => {
  window.customElements.define(
    'c-availability',

    class extends HTMLElement {
      constructor(args) {
        super(args);

        this.isAvailable = undefined;
        this.selectedDestination = undefined;
      }

      async connectedCallback() {
        this.classList.add('loading');
        this.appendChild(content.cloneNode(true));

        this.toggleDnDNode = this.querySelector('[data-selector=toggle-dnd]');
        this.toggleDnDNode.addEventListener('change', this);
        window.addEventListener('availabilityChange', () => {
          this.updateAvailabilityInterface();
        });

        this.destinations = [];

        const destinations = await getDestinations(true);
        this.destinations.push(...destinations);

        this.destinationSelectNode = this.querySelector('[data-selector=destination-select]');
        this.destinationSelectNode.addEventListener('change', this);

        this.updateAvailabilityInterface();
      }

      async updateSelectedDestination() {
        empty(this.destinationSelectNode);

        const { previousDestination } = await browser.storage.local.get('previousDestination');

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
            this.selectedDestination = destination;
          } else if (
            this.selectedDestination.phoneaccount === null &&
            previousDestination !== undefined &&
            destination.id === previousDestination.id
          ) {
            select(option);
            this.selectedDestination = destination;
          }
          this.destinationSelectNode.appendChild(option);
        });
        this.classList.remove('loading');
      }

      updateAvailabilityInterface() {
        getSelectedDestination().then(selected => {
          this.selectedDestination = selected;
          this.isAvailable = this.selectedDestination.phoneaccount === null ? false : true;

          this.updateSelectedDestination();
          enable(this.toggleDnDNode);
          if (this.isAvailable) {
            enable(this.destinationSelectNode);
          } else {
            this.toggleDnDNode.checked = true;
          }
        });
      }

      async getSavedDestination() {
        let previousDestination = await browser.storage.local.get('previousAvailability');
        return previousDestination['previousAvailability'];
      }

      disconnectedCallback() {
        this.destinationSelectNode.removeEventListener('change', this);
      }

      async handleEvent({ type, currentTarget, currentTarget: { checked }, target: { value } }) {
        switch (currentTarget) {
          case this.toggleDnDNode:
            if (checked !== this.isAvailable) {
              return;
            }
            await setUnavailable(checked);
            if (checked) {
              disable(this.destinationSelectNode);
            } else {
              enable(this.destinationSelectNode);
            }
            break;

          case this.destinationSelectNode:
            if ('change' === type) {
              segment.track.updateAvailability();
              const destination = this.destinations.find(destination => destination.id == value);
              await setDestination(destination);
            }
            break;
        }
      }
    }
  );
});
