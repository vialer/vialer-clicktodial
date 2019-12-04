// import { loadTemplate } from '../utils/dom.mjs';

const phoneElementClassName = 'vialer-phone-number';

const template = document.createElement('template');
template.innerHTML = `
`;

// loadTemplate('c-click-to-dial-wrapper').then(({ content }) => {

window.customElements.define(
  'c-click-to-dial-wrapper',

  class extends HTMLElement {
    connectedCallback() {
      // this.appendChild(content.cloneNode(true));
      this.appendChild(template.content.cloneNode(true));
      this.className = phoneElementClassName;
    }
  }
);
// })
