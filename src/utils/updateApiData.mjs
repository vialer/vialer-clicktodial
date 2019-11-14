
import { getUser, getQueues, getContact } from '/lib/data.mjs';
import browser from '/vendor/browser-polyfill.js';

const userTimeout = 2 * 60 * 1000; // = 2 minutes
const queuesTimeout = 2 * 60 * 1000;
const contactsTimeout = 2 * 60 * 1000;

export async function updateApiData() {
    const storedTimeStamps = await browser.storage.local.get('timeStamps');
    let timeStampNow = new Date().getTime();
    if (Object.keys(storedTimeStamps).length === 0 ) {
        browser.storage.local.set({ 'timeStamps': { 'queues': timeStampNow, 'user': timeStampNow, 'contacts': timeStampNow } });
    } else {
        if (timeStampNow - storedTimeStamps.timeStamps.queues > queuesTimeout) {
            getQueues(true);
            storedTimeStamps.timeStamps.queues = timeStampNow;
        };
        if (timeStampNow - storedTimeStamps.timeStamps.user > userTimeout) {
            getUser(true);
            storedTimeStamps.timeStamps.user = timeStampNow;
        };
        if (timeStampNow - storedTimeStamps.timeStamps.contacts > contactsTimeout) {
            getContact(true);
            storedTimeStamps.timeStamps.contacts = timeStampNow;
        };
        browser.storage.local.set(storedTimeStamps);
    }
}
