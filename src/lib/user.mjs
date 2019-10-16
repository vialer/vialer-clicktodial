import request from '/lib/request.mjs';
import { getUser } from './data.mjs';

export function login({ email, password, token }) {
    const body = { email, password };
    if (token) {
        body.two_factor_token = token;
    }
    return request('login', { body }).then(({ api_token }) => {
        localStorage.setItem('token', `Token ${email}:${api_token}`);
    })
}

export async function logout() {
    localStorage.clear();
    browser.storage.local.clear();
  }

export async function isAuthenticated() {
    try {
        const user = await getUser();
        if(user.token){
            return true;
        } else{
            return false;
        }
    } catch (err) {
        // if (err.message == 'You need to change your password in the portal') {
        //     throw new Error('change_temp_password');
        // }
        // throw new Error('unauthorised');
    }
}
