import '/components/c-account-info.mjs';
import '/components/c-colleagues.mjs';
import '/components/c-call-groups.mjs';
import '/components/c-availability.mjs';
import '/components/c-toggle.mjs';

import { loadTemplate } from '/utils/dom.mjs';

loadTemplate('p-main').then(({ content }) => {
  window.customElements.define(
    'p-main',
    class extends HTMLElement {
      connectedCallback() {
        this.appendChild(content.cloneNode(true));
      }
    }
  );
});
