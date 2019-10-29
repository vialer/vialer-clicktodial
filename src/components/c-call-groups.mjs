import '/components/c-contact.mjs';

import { toggleVisibility, loadTemplate } from '/lib/dom.mjs';
import { getQueues } from '/lib/data.mjs';

loadTemplate('c-call-groups').then(({ content }) => {

    window.customElements.define('c-call-groups',

        class extends HTMLElement {
            constructor() {
                super();
                this.dataRetrieved = false;
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                console.log("Component mounted");
                this.list = this.querySelector('[data-selector=call-groups]');
                this.list.setAttribute("hidden", "");

                this.openList = this.querySelector('[data-selector=open-groups]');
                this.openList.addEventListener('click', this);

                this.pushToWebphone = this.querySelector('[data-selector=push-to-webphone]');

                //TODO url niet zo
                this.pushToWebphone.setAttribute('href', "https://webphone.vialer.nl/queues");

                this.getContactData();
            }

            disconnectedCallback() {
                this.openList.removeEventListener('click', this);
            }

            handleEvent(e) {
                toggleVisibility(this.list);
            }

            getContactData() {
                getQueues().then((queues) => {
                    this.dataRetrieved = true;
                    queues.forEach(queue => {
                        let contact = document.createElement("c-contact");
                        contact.contactDetails = queue;
                        this.list.appendChild(contact);
                    });
                });
            }
        }
    );
})
