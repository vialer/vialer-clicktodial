import '/components/c-contact.mjs';

import { toggleVisibility } from '/lib/dom.mjs';
import { getQueues } from '/lib/data.mjs';

const template = document.createElement('template');
template.innerHTML = `
<span id="open-groups"><h3>Call groups</h3></span> <a title="See queues" id="push-to-webphone" target="_blank">open queues</a>     
<div id="call-groups">
</div>
`;

window.customElements.define('c-call-groups',

    class extends HTMLElement {
        constructor() {
            super();
            this.dataRetrieved = false;
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");
            this.list = this.querySelector('#call-groups');
            this.list.setAttribute("hidden", "");

            this.openList = this.querySelector('#open-groups');
            this.openList.addEventListener('click', this);

            this.pushToWebphone = this.querySelector('#push-to-webphone');
            
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
