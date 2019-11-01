import '/components/c-contact.mjs';

import { toggleVisibility, show, hide, loadTemplate } from '/utils/dom.mjs';
import { getContact } from '/lib/data.mjs';

loadTemplate('c-colleagues').then(({ content }) => {
    window.customElements.define('c-colleagues',

        class Colleagues extends HTMLElement {
            constructor() {
                super();
                this.dataRetrieved = false;
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                console.log("Component mounted");

                this.list = this.querySelector('[data-selector=colleagues]');
                this.list.setAttribute("hidden", "");

                this.openList = this.querySelector('[data-selector=open-colleagues]');
                this.openList.addEventListener('click', this);

                this.pushToWebphone = this.querySelector('[data-selector=push-to-webphone]');
                // TODO url niet zo zetten
                this.pushToWebphone.setAttribute('href', "https://webphone.vialer.nl/contacts");

                this.searchInput = this.querySelector('[data-selector=searchInput]');
                this.searchInput.addEventListener('input', this);


                this.getContactData();
            }

            disconnectedCallback() {
                this.openList.removeEventListener('click', this);
            }

            handleEvent({ type }) {
                switch (type) {
                    case 'click':
                        toggleVisibility(this.list);
                        break;
                    case 'input':
                        show(this.list);
                        this.applyContactsFilters();
                        break;
                }
            }

            getContactData() {
                getContact().then((contacts) => {
                    this.dataRetrieved = true;
                    contacts.forEach(contact => {
                        let colleague = document.createElement("c-contact");
                        colleague.contactDetails = contact;
                        this.list.appendChild(colleague);
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
                // TODO besluiten dit wel of niet
                // this.sortAlphabeticCharacterVisibility();
            }
        }
    );
})