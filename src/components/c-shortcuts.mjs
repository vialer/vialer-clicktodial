import { loadTemplate } from '/lib/dom.mjs';

loadTemplate('c-shortcuts').then(({ content }) => {
    window.customElements.define('c-shortcuts',

        class extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                console.log("Component mounted");
                this.popout = this.querySelector('[data-selector=popout]');
                this.help = this.querySelector('[data-selector=help]');
                this.settings = this.querySelector('[data-selector=settings]');
                this.setUrls();
            }

            setUrls() {
                this.popout.setAttribute('href', "https://webphone.vialer.nl/");
                this.help.setAttribute('href', "https://wiki.voipgrid.nl/index.php/Browser_Plugins");
                this.settings.setAttribute('href', "https://webphone.vialer.nl/settings");
            }
        });
})
