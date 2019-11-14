(function () {
  'use strict';

  const BASE = "https://partner.voipgrid.nl/api/";

  const CONFIGS = {
    contacts: {
      method: 'GET',
      useToken: true,
      path: 'phoneaccount/basic/phoneaccount/?active=true&order_by=description'
    },
    user: {
      method: 'GET',
      useToken: true,
      path: 'plugin/user/'
    },
    autologin: {
      method: 'GET',
      useToken: true,
      path: 'autologin/token/'
    },
    queues: {
      method: 'GET',
      useToken: true,
      path: 'queuecallgroup/'
    },
    clickToDial: {
      method: 'POST',
      useToken: true,
      path: 'clicktodial/',
      headers: {
        'Content-type': 'application/json'
      }
    },
    callStatus: {
      method: 'GET',
      useToken: true,
      path: '/clicktodial/',
      setCallId: true
    },
    setDestination: {
      method: 'PUT',
      useToken: true,
      path: 'selecteduserdestination/',
      headers: {
        'Content-type': 'application/json'
      }
    },
    getDestination: {
      method: 'GET',
      useToken: true,
      path: 'selecteduserdestination/'
    },
    destinations: {
      method: 'GET',
      useToken: true,
      path: 'userdestination/'
    },
    login: {
      method: 'POST',
      path: 'permission/apitoken/',
      headers: {
        'Content-type': 'application/json'
      }
    }
  };

  function makeRequestObject(name, options) {
    let config;

    if (name in CONFIGS) {
      config = Object.assign({}, CONFIGS[name]);
    } else {
      throw new Error(`api config '${name}' not found`);
    }

    const requestOptions = Object.assign({ headers: {} }, config, options);

    if (requestOptions.useToken) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('unauthorised');
      }
      requestOptions.headers['authorization'] = token;
    }

    if (requestOptions.id) {
      requestOptions.path += `${requestOptions.id}/`;
    }

    // To be able to make a call.
    if (requestOptions.setCallId) {
      requestOptions.path += localStorage.getItem('callid');
    }

    if (requestOptions.params) {
      const queryString = Object.keys(requestOptions.params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(requestOptions.params[k]))
        .join('&');

      requestOptions.path += `?${queryString}`;
    }

    if (requestOptions.body && typeof requestOptions.body === 'object') {
      requestOptions.body = JSON.stringify(requestOptions.body);
    }

    const url = `${BASE}${requestOptions.path}`;

    delete requestOptions.path;
    delete requestOptions.useToken;
    delete requestOptions.params;
    delete requestOptions.id;

    return { url, requestOptions };
  }

  async function responseHandler(response) {
    const { status } = response;
    let json;

    if (status === 400) {
      try {
        json = await response.json();
        return Promise.reject({
          status,
          url: response.url,
          statusText: response.statusText,
          body: json
        });
      } catch (err) {
        throw new Error('bad request');
      }
    }

    if (status === 401) {
      throw new Error('unauthorised');
    }

    if (status === 403) {
      const message = await response.text();
      throw new Error(message);
    }

    if (status === 404) {
      // not found
      return undefined;
    }

    if (status === 429) {
      throw new Error('too_many_requests');
    }

    if (status === 200 || status === 201) {
      try {
        json = await response.json();
        return json;
      } catch (err) {
        return {};
      }
    }
  }

  function request(name, options) {
    const { url, requestOptions } = makeRequestObject(name, options);
    return fetch(url, requestOptions).then(responseHandler);
  }

  function logToConsole(level, module, message, ...args) {
      const fn =
        {
          error: console.error,
          warn: console.warn,
          info: console.info,
          debug: console.log,
          verbose: console.log
        }[level] || console.debug;
    
      const colors = {
        error: `#c0392b`, // Red
        warn: `#f39c12`, // Yellow
        info: `blue`, // Blue
        debug: `#7f8c8d`, // Gray
        verbose: `#2ecc71` // Green
      };
    
      // from Workbox
      const styles = [
        `background: ${colors[level]}`,
        `border-radius: 0.5em`,
        `color: white`,
        `font-weight: bold`,
        `padding: 2px 0.5em`
      ];
    
      fn(`%c${module}%c ${message}`, styles.join(';'), '', ...args);
    }

  // import * as RemoteLogging from '/lib/remote-logging.mjs';

  const LEVELS = {
    error: 4,
    warn: 3,
    info: 2,
    verbose: 1,
    debug: 0
  };

  class Logger {
    constructor(module) {
      this.module = module;

      // Define aliases for each log level on Logger.
      // eg. `Logger.info(...) = Logger.log('info', ...)`
      Object.keys(LEVELS).forEach(level => {
        this[level] = (function() {
          this.log.call(this, level, ...arguments);
        }).bind(this);
      });
    }

    log(level, message, ...args) {
      // if (levelIdx >= verbosityIdx) {
        logToConsole(level, this.module, message, ...args);
      // }
      // TODO later remote logging toevoegen
      // RemoteLogging.enqueueMessage(level, this.module, message, ...args);
    }
  }

  function showNotification(title, options) {
      let notification = new Notification(title, options);
  }

  const logger = new Logger('data');

  let callStatusInterval;

  async function clickToDial(bNumber) {
    const body = { b_number: bNumber };
    try {
      const { a_number, auto_answer, b_number, callid } = await request('clickToDial', { body });
      localStorage.setItem('callid', callid);
      callStatusInterval = setInterval(getCallStatus, 3000);
      return { a_number, auto_answer, b_number, callid };
    } catch (err) {
      logger.error('Call not succesfull', err);
    }
  }

  async function getCallStatus() {
    const { a_number, auto_answer, b_number, callid, status } = await request('callStatus');
    stopIntervalAtStatus(status);
    // return { a_number, auto_answer, b_number, callid, status };
  }

  function stopIntervalAtStatus(status) {
    if (status !== 'dialing_b') {
      showNotification(status);
      clearInterval(callStatusInterval);
    }
  }

  // import 'webextension-polyfill';
  // import * as segment from './lib/segment.mjs';
  // import { startTrackingUser } from './utils/startTrackingUser.mjs';

  // startTrackingUser();
  const logger$1 = new Logger('background');


  chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
      if (request.b_number) {
          clickToDial(request.b_number).then(({ b_number }) => {
              showNotification(`calling ${b_number}`);
              sendResponse({ update: 'Trying to make the call' });
          }).catch((e)=>{
              logger$1.error(e);
          });
          //TODO notificatie als er error status code terugkomt
      }
  });

}());
