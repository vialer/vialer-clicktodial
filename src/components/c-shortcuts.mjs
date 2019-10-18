const template = document.createElement('template');
template.innerHTML = `
                    <a id="popout" target="_blank">meh</a>
                    <a id="help" target="_blank">mehhh</a>
                    <a id="settings" target="_blank">mehh</a>          
`;

window.customElements.define('c-shortcuts',

    class extends HTMLElement { 
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
            console.log("Component mounted");
            this.popout = this.querySelector('#popout');
            this.help = this.querySelector('#help');
            this.settings = this.querySelector('#settings');
            this.setUrls();
        }

        setUrls(){
            this.popout.setAttribute('href', "https://webphone.vialer.nl/");
            this.help.setAttribute('href', "https://wiki.voipgrid.nl/index.php/Browser_Plugins");
            this.settings.setAttribute('href', "https://webphone.vialer.nl/settings");
        }
    });