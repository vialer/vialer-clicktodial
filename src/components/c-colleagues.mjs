import { getContact } from '/lib/data.mjs';
import '/components/c-colleague.mjs';

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
<h1>Colleagues</h1>
<button>✅</button>

<ul id="colleagues">
</ul>
`;



window.customElements.define('c-colleagues',

    class Colleagues extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");
            this.list = this.querySelector('#colleagues');
            this.submitButton = this.querySelector('button');
            this.submitButton.addEventListener('click', this);
        }

        disconnectedCallback() {
            this.submitButton.removeEventListener('click', this);
        }

        handleEvent(e) {
            this.getContactData();
        }

        getContactData() {
            getContact().then((colleagueList) => {
                let contacts = colleagueList.objects;
                contacts.forEach(contact => {
                    let colleague = document.createElement("c-colleague");
                    colleague.contactDetails = contact;
                    this.list.appendChild(colleague);
                });
            });
        }
    }
);
