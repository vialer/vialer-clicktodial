import { isAuthenticated as check } from '/lib/user.mjs';
import { updateApiData } from '/utils/updateApiData.mjs';
import { Logger } from '/lib/logging.mjs';
import { startTrackingUser } from '/utils/startTrackingUser.mjs';
import { translateNodes, setChosenLanguage } from '/lib/i18n.mjs';

import '/pages/p-login.mjs';
import '/pages/p-main.mjs';

const logger = new Logger('router');

window.customElements.define('c-router',

    class extends HTMLElement {

        constructor() {
            super();
            this.main = undefined;
            this.login = undefined;
        }

        async showView() {
            check().then((isAuthenticated) => {
                if (isAuthenticated) {
                    if (this.login !== undefined) { this.login.remove() }
                    updateApiData();
                    this.main = document.createElement('p-main');
                    this.appendChild(this.main);
                } else {
                    if (this.main !== undefined) {
                        this.main.remove();
                    }
                    this.setLogin();
                }
                setChosenLanguage().then(()=>{
                    translateNodes();
                });
            }).catch((err) => {
                this.setLogin();
                logger.warn('Change of password needed');
                this.login.showChangePasswordMessage;
            });
        }

        setLogin() {
            if (this.login === undefined) {
                this.login = document.createElement('p-login');
                this.appendChild(this.login);
            }
        }

        connectedCallback() {
            // TODO dit verwijderen als tracking user vanuit background succesvol is.
            startTrackingUser();
            window.addEventListener('updatePlugin', () => {
                this.showView();
            });
            this.showView();
        }
    }
);