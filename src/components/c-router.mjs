import { isAuthenticated as check } from '/lib/user.mjs';

import '/pages/p-login.mjs';
import '/pages/p-main.mjs';


window.customElements.define('c-router',

    class extends HTMLElement {

        constructor() {
            super();
            this.main = undefined;
            this.login = undefined;
        }
     
        async showView() {
            let isAuthenticated = await check();
            console.log(isAuthenticated);
            if (isAuthenticated) {
                if (this.login !== undefined) { this.login.remove() }
                this.main = document.createElement('p-main');
                this.appendChild(this.main);
            } else {
                if (this.main !== undefined) {
                    this.main.remove();
                }
                if(this.login === undefined){
                    this.login = document.createElement('p-login');
                    this.appendChild(this.login);
                }
            }
        }

        connectedCallback() {
            window.addEventListener('updatePlugin', () => {
                this.showView();
            });
            this.showView();
        }
    }
);