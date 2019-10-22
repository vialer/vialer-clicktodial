import * as user from '/lib/user.mjs';
import { getFormValues , show, hide} from '/lib/dom.mjs';

const template = document.createElement('template');
template.innerHTML = `
<h1>Login</h1>
<form class="login-form">
        <div class="login-error" data-selector="authentication-error" hidden>
          <c-icon icon="warning"></c-icon>
          <span data-translation-key="authentication_error"></span>
        </div>
        <div class="login-change-password" data-selector="change-password" hidden>
        <p><span class="login-change-password-title" data-translation-key="change_password_title"></span></p>
        <p>
          <span data-translation-key="change_password_body"></span>
          <a data-selector="change-password-link" target="_blank">link</a>
        </p>
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
            <label hidden data-selector="two-factor-container">
            <h5> Two factor bladiebla </h5>
            <span data-translation-key="two-factor-token"></span>
            <input type="text" name="token" data-selector="two-factor-input" />
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

            this.twoFactorAuthenticationInput = this.querySelector('[data-selector=two-factor-input]');
            this.twoFactorAuthenticationContainerNode = this.querySelector(
                '[data-selector=two-factor-container]'
            );


            this.changePasswordNode = this.querySelector('[data-selector=change-password]');
            this.changePasswordLink = this.querySelector('[data-selector=change-password-link');
            this.authenticationErrorNode = this.querySelector('[data-selector=authentication-error]');
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
                    const { email, password, token } = getFormValues(target);
                    const payload = { email, password };
                    hide(this.twoFactorAuthenticationContainerNode);

                    if (token) {
                        payload.token = token;
                    }

                    if (email && password) {
                        user.login(payload)
                            .then(async () => {
                                window.dispatchEvent(new CustomEvent('updatePlugin'));
                            }).catch(err => {
                                const { status, body, message } = err;
                                if (status === 400 && body && body.apitoken && body.apitoken.two_factor_token) {
                                    this.showtwoFactorAuthenticationContainer();
                                } else if (status ===403){//message === 'change_temp_password') {
                                    this.showChangePasswordMessage();
                                } else {
                                    show(this.authenticationErrorNode);
                                }
                            });
                    }
            }
        }

        showtwoFactorAuthenticationContainer() {
            show(this.twoFactorAuthenticationContainerNode);
            this.twoFactorAuthenticationInput.setAttribute('required', '');
        }

        showChangePasswordMessage() {
            // voor later
            // const path = await getPlatformUrl('user/personal_settings');
            this.changePasswordLink.setAttribute('href', "https://partner.voipgrid.nl/user/login");
            show(this.changePasswordNode);
        } u
    }
);
