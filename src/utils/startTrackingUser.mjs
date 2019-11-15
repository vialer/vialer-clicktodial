import { Logger } from '../lib/logging.mjs';
import * as segment from '../lib/segment.mjs';
import browser from '/vendor/browser-polyfill.js';

const logger = new Logger('startTrackingUser');

export async function startTrackingUser() {
    if (!segmentUserIdSet()) {
        browser.storage.local.get("user").then(async (user) => {
            if (Object.keys(user).length !== 0) {
                let email = user.user.email;
                await segment.setUserId(email);
            } else {
                logger.warn('User not yet logged in, tracking not possible');
            }
        });
    } else {
        logger.info('UserId already set for this user');
    }
}

async function segmentUserIdSet() {
    let sUserId = await browser.storage.local.get('segmentUser');
    if (sUserId) {
        return true;
    }
    return false;
}
