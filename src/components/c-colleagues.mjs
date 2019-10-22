import '/components/c-contact.mjs';

import { toggleVisibility } from '/lib/dom.mjs';
import { getContact } from '/lib/data.mjs';

const template = document.createElement('template');
template.innerHTML = `
<style>
    :host {
    display: block;
    font-family: sans-serif;
    text-align: center;
    }

    button {
    border: none;
    cursor: pointer;
    }

    ul {
    list-style: none;
    padding: 0;
    }
</style>
<span id="open-colleagues"><h3>Colleagues</h3></span> <a title="See availability of colleagues" id="push-to-webphone" target="_blank">open collegaatjes</a>     
<div id="colleagues">
</div>
`;

window.customElements.define('c-colleagues',

    class Colleagues extends HTMLElement {
        constructor() {
            super();
            this.dataRetrieved = false;
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");

            this.list = this.querySelector('#colleagues');
            this.list.setAttribute("hidden", "");

            this.openList = this.querySelector('#open-colleagues');
            this.openList.addEventListener('click', this);

            this.pushToWebphone = this.querySelector('#push-to-webphone');
            this.pushToWebphone.setAttribute('href', "https://webphone.vialer.nl/contacts");

            this.getContactData();
        }

        disconnectedCallback() {
            this.openList.removeEventListener('click', this);
        }

        handleEvent(e) {
            toggleVisibility(this.list);
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
    }
);
