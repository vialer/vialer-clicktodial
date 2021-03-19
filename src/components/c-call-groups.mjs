import '/components/c-queue.mjs';

import { hide, show, loadTemplate } from '/utils/dom.mjs';
import { getQueues } from '/lib/data.mjs';

loadTemplate('c-call-groups').then(({ content }) => {
  window.customElements.define(
    'c-call-groups',

    class extends HTMLElement {
      getQueuesData() {
        getQueues().then((queues) => {
          this.dataRetrieved = true;
          queues.forEach((queue) => {
            let queueNode = document.createElement('c-queue');
            this.list.appendChild(queueNode);

            queueNode.queueDetails = queue;
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

        this.getQueuesData();
      }

      disconnectedCallback() {
        this.toggleNode.removeEventListener('toggle-open', this);
        this.toggleNode.removeEventListener('toggle-close', this);
      }
    }
  );
});
