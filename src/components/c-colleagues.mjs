import '/components/c-contact.mjs';

import { show, hide, loadTemplate } from '/utils/dom.mjs';
import { getContact } from '/lib/data.mjs';

loadTemplate('c-colleagues').then(({ content }) => {
  window.customElements.define(
    'c-colleagues',

    class Colleagues extends HTMLElement {
      constructor() {
        super();
        this.dataRetrieved = false;
      }

      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.list = this.querySelector('[data-selector=colleagues]');

        this.toggleNode = this.querySelector('c-toggle');
        this.toggleNode.addEventListener('toggle-open', this);
        this.toggleNode.addEventListener('toggle-close', this);

        this.searchInput = this.querySelector('[data-selector=searchInput]');
        this.searchInput.addEventListener('input', this);

        this.getContactData();
      }

      disconnectedCallback() {
        this.toggleNode.removeEventListener('toggle-open', this);
        this.toggleNode.removeEventListener('toggle-close', this);
      }

      handleEvent({ type }) {
        switch (type) {
          case 'toggle-open':
            show(this.list);
            break;

          case 'toggle-close':
            hide(this.list);
            break;

          case 'input':
            if (!this.toggleNode.hasAttributes('open')) {
              this.toggleNode.setAttribute('open', '');
            }
            this.applyContactsFilters();
            break;
        }
      }

      getContactData() {
        getContact().then(contacts => {
          this.dataRetrieved = true;
          contacts.forEach(contact => {
            let colleague = document.createElement('c-contact');
            this.list.appendChild(colleague);
            colleague.contactDetails = contact;
          });
        });
      }

      applyContactsFilters() {
        const { children } = this.list;
        const { value } = this.searchInput;

        for (const node of children) {
          if (node.nodeName !== 'C-CONTACT') {
            continue;
          }
          node.doesMatchSearchString(value) ? show(node) : hide(node);
        }
      }
    }
  );
});
