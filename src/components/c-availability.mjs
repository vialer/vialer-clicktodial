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

      async firstTimePreviousDestination(selected) {
        const { previousDestination } = await browser.storage.local.get('previousDestination');
        if (previousDestination === undefined) {
          if (selected.fixeddestination !== null || selected.phoneaccount !== null) {
            const destination = this.destinations.find(destination => destination.id == selected.phoneaccount);
            browser.storage.local.set({ previousDestination: destination });
          } else {
            browser.storage.local.set({ previousDestination: this.destinations[0] });
          }
        }
      }

      updateAvailabilityInterface() {
        getSelectedDestination().then(async selected => {
          this.selectedDestination = selected;
          this.isAvailable = this.selectedDestination.phoneaccount === null ? false : true;

          await this.firstTimePreviousDestination(selected);

          this.updateSelectedDestination();

          enable(this.toggleDnDNode);
          if (this.isAvailable) {
            enable(this.destinationSelectNode);
          } else {
            this.toggleDnDNode.checked = true;
          }
        });
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

      disconnectedCallback() {
        this.destinationSelectNode.removeEventListener('change', this);
        this.toggleDnDNode.removeEventListener('change', this);
      }
    }
  );
});
