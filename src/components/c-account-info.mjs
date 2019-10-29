import { logout } from '/lib/user.mjs';
import { getUser } from '/lib/data.mjs';
import { loadTemplate } from '/lib/dom.mjs';

import '/components/c-shortcuts.mjs';

loadTemplate('c-account-info').then(({ content }) => {
    window.customElements.define('c-account-info',

        class extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.appendChild(content.cloneNode(true));
                console.log("Component mounted");
                this.logout = this.querySelector('[data-selector=log-out]');
                this.logout.addEventListener('click', this);
                this.userName = this.querySelector('[data-selector=user-name]');
                this.setUserInfo();
                let shortcuts = document.createElement('c-shortcuts');
                this.appendChild(shortcuts);
            }

            disconnectedCallback() {
                this.logout.removeEventListener('click', this);
            }

            handleEvent(e) {
                e.preventDefault();
                switch (e.type) {
                    case 'click':
                        logout().then(async () => {
                            window.dispatchEvent(new CustomEvent('updatePlugin'));
                        });
                        break;
                }
            }

            setUserInfo() {
                getUser().then((userInfo) => {
                    this.userName.textContent = userInfo.email;
                });
            }
        });
})