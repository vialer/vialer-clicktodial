import { empty, loadIcon } from "/utils/dom.mjs";

window.customElements.define(
  "c-icon",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["icon"];
    }

    connectedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
      if (this.isConnected) {
        const folder = this.getAttribute("folder") || "/icons/";
        loadIcon(`${folder}${newValue}`)
          .then(({ content }) => {
            empty(this);
            this.appendChild(content.cloneNode(true));
          })
          .catch(console.error);
      }
    }
  }
);
