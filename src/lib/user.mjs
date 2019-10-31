import request from '/lib/request.mjs';
import { getUser } from './data.mjs';
import { Logger } from '/lib/logging.mjs';
import * as segment from '/lib/segment.mjs';

const logger = new Logger('user');

export function login({ email, password, token }) {
    const body = { email, password };
    if (token) {
        body.two_factor_token = token;
    }
    return request('login', { body }).then(async ({ api_token }) => {
        await segment.setUserId(email);
        localStorage.setItem('token', `Token ${email}:${api_token}`);
        logger.info(`Succesfull login with for: ${email}`);
        segment.track.login();
    })
}

export async function logout() {
    segment.track.logout();
    localStorage.clear();
    browser.storage.local.clear();
    logger.info('Storages cleared, logout succesfull');
}

export async function isAuthenticated() {
    try {
        let user = await getUser(true);
        if (user.token) {
            return true;
        } else {
            return false;
        }

    } catch (err) {
        if (err.message == 'You need to change your password in the portal') {
            localStorage.clear();
            throw new Error('change_temp_password');
        }
        return false;
        // throw new Error('unauthorised');
    }
}
