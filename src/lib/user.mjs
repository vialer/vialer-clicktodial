import request from '/lib/request.mjs';
import { getUser } from './data.mjs';
import { Logger } from '/lib/logging.mjs';

const logger = new Logger('user');


export function login({ email, password, token }) {
    const body = { email, password };
    if (token) {
        body.two_factor_token = token;
    }
    return request('login', { body }).then(({ api_token }) => {
        localStorage.setItem('token', `Token ${email}:${api_token}`);
        logger.info(`Succesfull login with for: ${email}`);
    })
}

export async function logout() {
    localStorage.clear();
    browser.storage.local.clear();
    logger.info('Storages cleared, logout succesfull'); 
}

export async function isAuthenticated() {
    try {
        let user = await getUser();
        if (user.token) {
            return true;
        } else {
            return false;
        }

    } catch (err) {
        if (err.message == 'You need to change your password in the portal') {
            throw new Error('change_temp_password');
        }
        return false;
        // throw new Error('unauthorised');
    }
}
