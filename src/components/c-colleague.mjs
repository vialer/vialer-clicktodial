const template = document.createElement('template');
template.innerHTML = `
`;



window.customElements.define('c-colleague',

    class Colleague extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");
        }

        set contactDetails(cDetail) {
            let detail = document.createElement("p");
            detail.innerText = cDetail.description + "\n" + cDetail.internal_number;
            this.appendChild(detail);
        }
    }
);
