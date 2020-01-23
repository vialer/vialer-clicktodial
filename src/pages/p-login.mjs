import * as user from '/lib/user.mjs';
import { getFormValues, show, hide, loadTemplate } from '/utils/dom.mjs';
import { Logger } from '/lib/logging.mjs';

const logger = new Logger('login');

loadTemplate('p-login').then(({ content }) => {
  window.customElements.define(
    'p-login',

    class extends HTMLElement {
      connectedCallback() {
        this.appendChild(content.cloneNode(true));
        this.formNode = this.querySelector('form');
        this.formNode.addEventListener('submit', this);

        this.twoFactorAuthenticationInput = this.querySelector('[data-selector=two-factor-input]');
        this.twoFactorAuthenticationContainerNode = this.querySelector('[data-selector=two-factor-container]');

        this.changePasswordNode = this.querySelector('[data-selector=change-password]');
        this.changePasswordLink = this.querySelector('[data-selector=change-password-link');
        this.authenticationErrorNode = this.querySelector('[data-selector=authentication-error]');
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

            this.email = email;

            if (token) {
              payload.token = token;
            }

            if (email && password) {
              user
                .login(payload)
                .then(async () => {
                  window.dispatchEvent(new CustomEvent('updatePlugin'));
                })
                .catch(err => {
                  const { status, body, message } = err;
                  if (status === 400 && body && body.apitoken && body.apitoken.two_factor_token) {
                    logger.warn('Two factor token needed');
                    this.showtwoFactorAuthenticationContainer();
                  } else if (message === 'change_temp_password' || status === 403) {
                    logger.warn('Password change needed');
                    this.showChangePasswordMessage();
                  } else {
                    logger.error('Not sure what went wrong, error = ' + err);
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
        const token = localStorage.getItem('token');
        if (!token || !this.email) {
          this.changePasswordLink.setAttribute('href', `%%VENDOR_PORTAL_URL%%user/personal_settings`);
        } else {
          this.changePasswordLink.setAttribute(
            'href',
            `%%VENDOR_PORTAL_URL%%user/autologin/?token=${token}&username=${this.email}&next=/user/personal_settings`
          );
        }

        hide(this.formNode);
        show(this.changePasswordNode);
      }
    }
  );
});
