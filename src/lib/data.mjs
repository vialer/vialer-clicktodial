import request from '/lib/request.mjs';

import { Logger } from '/lib/logging.mjs';

const logger = new Logger('data');

async function getStorageData({ storageName, forceRefresh, apiDataMutateCallback, apiRequestOption = {} }) {
  const storedData = await browser.storage.local.get(storageName);

  if (Object.keys(storedData).length === 0 || forceRefresh) {
    logger.info(`fetching ${storageName} from api`)
    return request(storageName, apiRequestOption)
      .then(async (data) => {
        if (apiDataMutateCallback) {
          data = apiDataMutateCallback(data.objects);
        }
        await browser.storage.local.set({ [storageName]: data });
        return data;
      })
  }
  logger.info(`fetching ${storageName} from storage.local`)
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
  }

  const colleagueList = getStorageData({ storageName: 'contacts', forceRefresh, apiDataMutateCallback });
  return colleagueList;
}

export async function getPreviousDestination() {
  return await browser.storage.local.get('previousDestination');
}

export async function getUser(forceRefresh = false) {
  const user = getStorageData({storageName: 'user', forceRefresh});
  return user;
}

export async function clickToDial(bNumber) {
  const body = { b_number: bNumber };
  try{
    // const { a_number, auto_answer, b_number, callid } = await request('clickToDial', { body });
    const dingie = await request('clickToDial', { body });
    console.log(dingie);
    // logger.debug(dingie);

  } catch(err){
    logger.error('Call not succesfull', err);
  }
  return { a_number, auto_answer, b_number, callid };
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

  const queues = getStorageData({ storageName: 'queues', forceRefresh, apiDataMutateCallback });
  return queues;
}

export async function getDestinations(forceRefresh = false) {
  const apiDataMutateCallback = objects => {
    const cleanObjects = [];

    objects.forEach(({ fixeddestinations, phoneaccounts }) => {

      fixeddestinations.forEach(({ id, description: desc, phonenumber }) => {
        const description = `+${phonenumber}${desc ? ` - ${desc}` : ''}`;

        cleanObjects.push({
          'fixedDestinations': {
            id,
            description,
            type: 'fixed'
          }
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

  const destinations = await getStorageData({ storageName: 'destinations', forceRefresh, apiDataMutateCallback });
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
  return await request('setDestination', { id, body });
}