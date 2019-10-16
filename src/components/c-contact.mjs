const template = document.createElement('template');
template.innerHTML = `
<style>
</style>
`;

customElements.define('c-contact',

    class Contact extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
        }

        set contactDetails(cDetail) {
            let detail = document.createElement("div");
            //TODO dit veranderen
            detail.innerText = cDetail.description + "\n" + cDetail.phoneNumber;
            this.appendChild(detail);
        }
    }
);
