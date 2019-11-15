import "/components/c-colleagues.mjs";
import "/components/c-call-groups.mjs";
import "/components/c-account-info.mjs";
import "/components/c-availability.mjs";

import { loadTemplate } from "/utils/dom.mjs";

loadTemplate("p-main").then(({ content }) => {
  window.customElements.define(
    "p-main",
    class extends HTMLElement {
      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.accountInfo = document.createElement("c-account-info");
        this.appendChild(this.accountInfo);

        this.availability = document.createElement("c-availability");
        this.appendChild(this.availability);

        this.colleagues = document.createElement("c-colleagues");
        this.appendChild(this.colleagues);

        this.queues = document.createElement("c-call-groups");
        this.appendChild(this.queues);
      }
    }
  );
});
