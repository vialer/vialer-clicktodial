import {
  availableLanguages,
  chosenLanguage,
  setLanguage,
  translateNodes
} from "/lib/i18n.mjs";
import { loadTemplate } from "/utils/dom.mjs";

loadTemplate("c-language-switcher").then(({ content }) => {
  window.customElements.define(
    "c-language-switcher",
    class extends HTMLElement {
      handleEvent({ target: { value } }) {
        if (value !== chosenLanguage) {
          setLanguage(value);
        }
      }

      update() {
        for (const option of this.selectNode.querySelectorAll("option")) {
          if (option.value === chosenLanguage) {
            option.setAttribute("selected", "");
          } else {
            option.removeAttribute("selected");
          }
        }
      }

      connectedCallback() {
        this.appendChild(content.cloneNode(true));

        this.selectNode = this.querySelector("[data-selector=language-select]");

        availableLanguages.forEach(async l => {
          const option = document.createElement("option");
          option.dataset.translationKey = l;
          option.value = l;
          option.textContent = l;

          if (l === chosenLanguage) {
            option.setAttribute("selected", "");
          }

          this.selectNode.appendChild(option);
        });

        translateNodes(this);

        this.selectNode.addEventListener("change", this);
      }
      disconnectedCallback() {
        this.selectNode.removeEventListener("change", this);
      }
    }
  );
});
