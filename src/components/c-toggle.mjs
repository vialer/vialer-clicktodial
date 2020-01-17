import { loadTemplate } from '/utils/dom.mjs';

loadTemplate('c-toggle').then(({ content }) => {
  window.customElements.define(
    'c-toggle',

    class extends HTMLElement {
      static get observedAttributes() {
        return ['open'];
      }

      handleEvent(e) {
        switch (e.type) {
          case 'click':
            if (this.hasAttribute('open')) {
              this.removeAttribute('open');
            } else {
              this.setAttribute('open', '');
            }
            break;
        }
      }

      dispatch() {
        if (!this.icon) {
          this.needToDispatchLater = true;
          return;
        }

        if (this.hasAttribute('open')) {
          this.dispatchEvent(new CustomEvent('toggle-open'));
          this.icon.classList.add('flip');
        } else {
          this.dispatchEvent(new CustomEvent('toggle-close'));
          this.icon.classList.remove('flip');
        }
      }

      attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
          case 'open':
            this.dispatch();
            break;
        }
      }
      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.button = this.querySelector('button');
        this.icon = this.querySelector('c-icon');

        this.button.addEventListener('click', this);

        if (this.needToDispatchLater) {
          delete this.needToDispatchLater;
          this.dispatch();
        }
      }

      disconnectedCallback() {
        this.button.removeEventListener('click', this);
      }
    }
  );
});
