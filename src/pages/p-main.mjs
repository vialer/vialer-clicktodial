import { isAuthenticated as check } from '/lib/user.mjs';

import '/components/c-colleagues.mjs';
import '/components/c-call-groups.mjs';
import '/components/c-account-info.mjs';
import '/components/c-availability.mjs';

const template = document.createElement('template');
template.innerHTML = ``;

window.customElements.define('p-main',

    class extends HTMLElement {

        constructor() {
            super();
            this.accountInfo = undefined;
            this.colleagues = undefined;
            this.queues = undefined;
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));

            this.accountInfo = document.createElement('c-account-info');
            this.appendChild(this.accountInfo);

            this.availability = document.createElement('c-availability');
            this.appendChild(this.availability);

            this.colleagues = document.createElement('c-colleagues');
            this.appendChild(this.colleagues);

            this.queues = document.createElement('c-call-groups');
            this.appendChild(this.queues);
        }
    }
);