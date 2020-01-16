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
        this.appendChild(content.cloneNode(true));

        this.toggleDnDNode = this.querySelector('[data-selector=toggle-dnd]');
        this.toggleDnDNode.addEventListener('change', this);

        window.addEventListener('availabilityChange', () => {
          this.updateAvailabilityInterface();
        });

        this.destinations = [...(await getDestinations(true))];

        //await setDestination(destination);

        this.destinationSelectNode = this.querySelector('[data-selector=destination-select]');
        this.destinationSelectNode.addEventListener('change', this);

        this.updateAvailabilityInterface();

        //const { previousDestination } = await browser.storage.local.get('previousDestination');
        //console.log(`prev: ${previousDestination}`);
        //const appels = this.destinations.find(destination => this.shouldAPIDestinationBeSelected(destination));
        //console.log(`dingvanapi: ${appels}`);
        //if (
        //  !previousDestination &&
        //  this.destinations.length > 0 &&
        //  !this.destinations.find(this.shouldAPIDestinationBeSelected.bind(this))
        //) {
        //  console.log('setitng ding');
        //  await browser.storage.local.set({ previousDestination: this.destinations[0] });
        //  //const destination = this.destinations.find(this.shouldAPIDestinationBeSelected.bind(this));
        //  //console.log(destination);
        //}
      }

      async updateSelectedDestination() {
        empty(this.destinationSelectNode);

        this.destinations.forEach(async destination => {
          const option = document.createElement('option');
          option.value = destination.id;
          option.textContent = destination.description;
          if (
            this.shouldAPIDestinationBeSelected(destination) ||
            (await this.shouldPreviousDestinationBeSelected(destination))
          ) {
            select(option);
            this.selectedDestination = destination;
          }
          this.destinationSelectNode.appendChild(option);
        });
      }

      shouldAPIDestinationBeSelected(destination) {
        console.log(destination);
        console.log(this.selectedDestination);
        return (
          this.selectedDestination &&
          (this.selectedDestination.phoneaccount == destination.id ||
            this.selectedDestination.userdestination == destination.id)
        );
      }

      async shouldPreviousDestinationBeSelected(destination) {
        const { previousDestination } = await browser.storage.local.get('previousDestination');
        return (
          this.selectedDestination.phoneaccount === null &&
          previousDestination !== undefined &&
          destination.id === previousDestination.id
        );
      }

      updateAvailabilityInterface() {
        getSelectedDestination().then(selected => {
          this.selectedDestination = selected;
          this.isAvailable = this.selectedDestination.phoneaccount === null ? false : true;

          this.updateSelectedDestination();

          enable(this.toggleDnDNode);
          console.log(this.isAvailable);
          if (this.isAvailable) {
            enable(this.destinationSelectNode);
          } else {
            this.toggleDnDNode.checked = true;
          }
        });
      }

      disconnectedCallback() {
        this.destinationSelectNode.removeEventListener('change', this);
      }

      async handleEvent({ type, currentTarget, currentTarget: { checked }, target: { value } }) {
        switch (currentTarget) {
          case this.toggleDnDNode:
            console.log('targettt');
            if (checked !== this.isAvailable) {
              return;
            }
            console.log(`a. - ${checked}`);
            await setUnavailable(checked);
            console.log(`b. - ${checked}`);
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
