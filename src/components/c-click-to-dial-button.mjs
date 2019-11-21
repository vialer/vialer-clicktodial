import { Logger } from "../lib/logging.mjs";
import browser from "/vendor/browser-polyfill.js";

const logger = new Logger("click-to-dial-button");
const phoneIconClassName = "vialer-icon";

const template = document.createElement("template");
template.innerHTML = `
<button data-selector="click-to-dial-button">
knop
<c-icon icon="phone"></c-icon>
</button>
`;

window.customElements.define(
  "c-click-to-dial-button",

  class extends HTMLElement {
    connectedCallback() {
      this.appendChild(template.content.cloneNode(true));
      this.callButton = this.querySelector(
        "[data-selector=click-to-dial-button]"
      );
      this.callButton.addEventListener("click", this);
      this.callButton.className = phoneIconClassName;
    }

    disconnectedCallback() {
      this.callButton.removeEventListener("click", this);
    }

    async handleEvent(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (this.phoneNumber) {
        browser.runtime
          .sendMessage(null, { b_number: this.phoneNumber })
          .then(() => {
            logger.info(`Trying to call ${this.phoneNumber}`);
          });
      }
    }

    set contactDetails(number) {
      this.phoneNumber = number;

    }

    get contactDetails() {
      return this.phoneNumber;
    }
  }
);
