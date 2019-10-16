import * as user from '/lib/user.mjs';

const template = document.createElement('template');
template.innerHTML = `
<h1>Login</h1>
<form class="login-form">
        <div class="login-error" data-selector="authentication-error" hidden>
          <c-icon icon="warning"></c-icon>
          <span data-translation-key="authentication_error"></span>
        </div>
        <label>
          <span data-translation-key="email_address"></span>
          <input
            type="email"
            name="email"
            data-selector="email-input"
            data-placeholder-translation-key="enter_email"
            autocomplete="username"
            required
          />
        </label>
        <label>
          <span data-translation-key="password"></span>
          <input
            type="password"
            name="password"
            data-selector="password-input"
            data-placeholder-translation-key="enter_password"
            autocomplete="current-password"
           required
          />
        </label>
        <button type="submit" data-translation-key="continue">✅</button>
      </form>
`;



window.customElements.define('p-login',

    class extends HTMLElement {
        constructor() {
            super();
        }

        connectedCallback() {
            // dit moet dus uiteindelijk anders
            this.appendChild(template.content.cloneNode(true));
            this.formNode = this.querySelector('form');
            this.formNode.addEventListener('submit', this);
            console.log("Component mounted");
            // this.changePasswordNode = this.querySelector('[data-selector=change-password]');    -> gebruiken voor later.
        }

        disconnectedCallback() {
            this.formNode.removeEventListener('submit', this);
        }

        handleEvent(e) {
            e.preventDefault();
            switch (e.type) {
                case 'click':
                    break;
                case 'submit':
                    const { target } = e;
                    const { email, password, token } = this.getFormValues(target);
                    const payload = { email, password };

                    if (token) {
                        payload.token = token;
                    }

                    if (email && password) {
                        user.login(payload)
                            .then(async () => {
                                window.dispatchEvent(new CustomEvent('updatePlugin'));
                            });
                    }
            }
        }

        // aparte dom.mjs maken?
        getFormValues(form) {
            return Array.from(form).reduce((prev, { name, value }) => {
                if (name && value) {
                    return Object.assign(prev, {
                        [name]: value
                    });
                } else {
                    return prev;
                }
            }, {});
        }
    }
);
