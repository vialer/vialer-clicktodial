import { Logger } from '/lib/logging.mjs';
import * as segment from '/lib/segment.mjs';

const logger = new Logger('startTrackingUser');

export async function startTrackingUser() {
    browser.storage.local.get("user").then(async(user)=>{
        if (Object.keys(user).length !== 0) {
            let email = user.user.email;
            await segment.setUserId(email);
        } else {
            logger.warn('User not yet logged in, tracking not possible');
        }
    });
}
