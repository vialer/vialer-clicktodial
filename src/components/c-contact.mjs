import { clickToDial } from '/lib/data.mjs';

const template = document.createElement('template');
template.innerHTML = `
<div id="contact">
<button id="call-me">bel</button>
</div>
`;

customElements.define('c-contact',

    class Contact extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            this.callButton = this.querySelector("#call-me");
            this.callButton.addEventListener('click', this);
        }

        disconnectedCallback() {
            this.callButton.removeEventListener();
        }

        async handleEvent(e) {
            if (this.phoneNumber) {
                let response = await clickToDial(this.phoneNumber);
                console.log(response);
            }
        }

        set contactDetails(cDetail) {
            let detail = document.createElement('div');
            this.phoneNumber = cDetail.phoneNumber;
            // this.detail = this.querySelector("#contact");
            //TODO dit veranderen
            detail.innerHTML = cDetail.description + "\n" + cDetail.phoneNumber;
            this.appendChild(detail);
        }
    }
);
