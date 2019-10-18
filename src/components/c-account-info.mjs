import { logout } from '/lib/user.mjs';
import { getUser } from '/lib/data.mjs';

import '/components/c-shortcuts.mjs';

const template = document.createElement('template');
template.innerHTML = `
                <span data-selector="user-name">     </span>
                <button data-selector="log-out" type="submit" >  Logout </button>
`;

window.customElements.define('c-account-info',

    class extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            this.appendChild(template.content.cloneNode(true));
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
