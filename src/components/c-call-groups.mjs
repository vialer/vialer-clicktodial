import '/components/c-contact.mjs';

import { hide, show, loadTemplate } from '/utils/dom.mjs';
import { getQueues } from '/lib/data.mjs';

loadTemplate('c-call-groups').then(({ content }) => {
  window.customElements.define(
    'c-call-groups',

    class extends HTMLElement {
      getContactData() {
        getQueues().then(queues => {
          this.dataRetrieved = true;
          queues.forEach(queue => {
            let contact = document.createElement('c-contact');
            this.list.appendChild(contact);

            contact.contactDetails = queue;
          });
        });
      }

      constructor() {
        super();
        this.dataRetrieved = false;
      }

      handleEvent({ type }) {
        switch (type) {
          case 'toggle-open':
            show(this.list);
            break;

          case 'toggle-close':
            hide(this.list);
            break;
        }
      }

      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.list = this.querySelector('[data-selector=call-groups]');

        this.toggleNode = this.querySelector('c-toggle');
        this.toggleNode.addEventListener('toggle-open', this);
        this.toggleNode.addEventListener('toggle-close', this);

        this.getContactData();
      }

      disconnectedCallback() {
        this.toggleNode.removeEventListener('toggle-open', this);
        this.toggleNode.removeEventListener('toggle-close', this);
      }
    }
  );
});
