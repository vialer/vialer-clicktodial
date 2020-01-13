import request from './request.mjs';
import { Logger } from './logging.mjs';
import { showNotification } from './notify.mjs';
import browser from '/vendor/browser-polyfill.js';
import { translate } from './i18n.mjs';

/**
 * data.mjs is responsible for retrieving data either from storage or from the API by making a request.
 * It is also responsible for setting up the call using the API
 */
const logger = new Logger('data');

async function getStorageData({ storageName, forceRefresh, apiDataMutateCallback, apiRequestOption = {} }) {
  const storedData = await browser.storage.local.get(storageName);

  if (Object.keys(storedData).length === 0 || forceRefresh) {
    logger.info(`fetching ${storageName} from api`);
    return request(storageName, apiRequestOption)
      .then(async data => {
        if (apiDataMutateCallback) {
          data = apiDataMutateCallback(data.objects);
        }
        await browser.storage.local.set({ [storageName]: data });
        return data;
      })
      .catch(err => {
        switch (err.message) {
          case 'You need to change your password in the portal':
            localStorage.clear();
            throw new Error('change_temp_password');
            break;

          case 'unauthorised':
            logger.error('Made an unauthorized request, possible password change. Removing token, updating view');
            localStorage.clear();
            window.dispatchEvent(new CustomEvent('updatePlugin'));
            break;
        }
      });
  }
  logger.info(`fetching ${storageName} from storage.local`);
  return storedData[storageName];
}

export async function getContact(forceRefresh = false) {
  const apiDataMutateCallback = objects => {
    const cleanObjects = [];

    objects.forEach(({ sipreginfo, description, internal_number, account_id, is_app_account }) => {
      const status = sipreginfo || is_app_account ? 'available' : 'offline';

      cleanObjects.push({
        description,
        status,
        phoneNumber: internal_number,
        accountId: account_id
      });
    });
    return cleanObjects;
  };

  const colleagueList = getStorageData({
    storageName: 'contacts',
    forceRefresh,
    apiDataMutateCallback
  });
  return colleagueList;
}

export async function getPreviousDestination() {
  return await browser.storage.local.get('previousDestination');
}

export async function getUser(forceRefresh = false) {
  const user = getStorageData({ storageName: 'user', forceRefresh });
  return user;
}

let callStatusInterval;

export async function clickToDial(bNumber) {
  const body = { b_number: bNumber };
  try {
    const { a_number, auto_answer, b_number, callid } = await request('clickToDial', { body });
    localStorage.setItem('callid', callid);
    callStatusInterval = setInterval(() => getCallStatus(bNumber), 3000);
    return { a_number, auto_answer, b_number, callid };
  } catch (err) {
    logger.error('Call not succesfull', err);
  }
}

const statusTranslations = {
  failed_a: () => translate('failed_a'),
  failed_b: () => translate('failed_b')
};

async function getCallStatus(bNumber) {
  const { a_number, auto_answer, b_number, callid, status } = await request('callStatus');
  stopIntervalAtStatus(status, bNumber);
}

async function stopIntervalAtStatus(status, bNumber) {
  if (status !== 'dialing_b' && status !== 'dialing_a') {
    let notification = status;

    if (status in statusTranslations) {
      notification = await statusTranslations[status]();

      if (status === 'failed_b') {
        notification = `${bNumber} ${notification}`;
      }
    }
    showNotification(notification);
    clearInterval(callStatusInterval);
  }
}

export async function getQueues(forceRefresh = false) {
  const apiDataMutateCallback = objects => {
    const cleanObjects = [];

    objects.forEach(({ id, description, internal_number, queue_size }) => {
      let status;
      if (queue_size > 10) {
        status = 'hectic';
      } else if (queue_size > 5) {
        status = 'busy';
      } else if (queue_size > 2) {
        status = 'moderate';
      } else {
        status = 'quiet';
      }

      cleanObjects.push({
        id,
        description,
        status,
        queueSize: queue_size,
        phoneNumber: internal_number
      });
    });
    return cleanObjects;
  };

  const queues = getStorageData({
    storageName: 'queues',
    forceRefresh,
    apiDataMutateCallback
  });
  return queues;
}

export async function getDestinations(forceRefresh = false) {
  const apiDataMutateCallback = objects => {
    const cleanObjects = [];

    objects.forEach(({ fixeddestinations, phoneaccounts }) => {
      fixeddestinations.forEach(({ id, description: desc, phonenumber }) => {
        const description = `+${phonenumber}${desc ? ` - ${desc}` : ''}`;
        cleanObjects.push({
          id,
          description,
          type: 'fixed'
        });
      });

      phoneaccounts.forEach(({ id, description: desc, internal_number }) => {
        const description = `${internal_number} - ${desc}`;
        cleanObjects.push({
          id,
          internalNumber: internal_number,
          description,
          type: 'account'
        });
      });
    });
    return cleanObjects;
  };

  const destinations = await getStorageData({
    storageName: 'destinations',
    forceRefresh,
    apiDataMutateCallback
  });
  return destinations;
}

export async function getSelectedDestination() {
  const data = await request('getDestination');
  const { id, fixeddestination, phoneaccount } = data.objects[0];
  return {
    id,
    fixeddestination,
    phoneaccount
  };
}

export async function setDestination(destination) {
  const { id } = await getSelectedDestination();
  const body = {
    fixeddestination: destination && destination.type === 'fixed' ? destination.id : null,
    phoneaccount: destination && destination.type === 'account' ? destination.id : null
  };

  return await request('setDestination', { id, body }).then(response => {
    if (destination) {
      browser.storage.local.set({ previousDestination: destination });
    }
  });
}

export async function setUnavailable(isUnavailable = true) {
  if (isUnavailable) {
    await setDestination();
  } else {
    const { previousDestination } = await browser.storage.local.get('previousDestination');
    await setDestination(previousDestination);
  }

  window.dispatchEvent(
    new CustomEvent('availabilityChange', {
      detail: { disabled: isUnavailable }
    })
  );
}
