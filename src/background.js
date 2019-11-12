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

  // Code from https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest

  // https://stackoverflow.com/a/2117523
  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
  }

  // Based on: https://github.com/segmentio/analytics-node
  // import pRetry from 'p-retry';

  class Analytics {
    /**
     * Initialize a new `Analytics` with your Segment project's `writeKey` and an
     * optional dictionary of `options`.
     *
     * @param {String} writeKey
     * @param {Object} [options] (optional)
     *   @property {Number} flushAt (default: 20)
     *   @property {Number} flushInterval (default: 10000)
     *   @property {String} host (default: 'https://api.segment.io')
     *   @property {Boolean} enable (default: true)
     */
    constructor(writeKey, options = {}) {
      if (!writeKey) {
        throw new Error("You must pass your Segment project's write key.");
      }

      this.queue = [];
      this.writeKey = writeKey;
      this.host = options.host || 'https://api.segment.io';
      this.timeout = options.timeout || false;
      this.flushAt = Math.max(options.flushAt, 1) || 20;
      this.flushInterval = options.flushInterval || 10000;
      this.flushed = false;
      this.retryCount = options.retryCount || 3;
    }

    identify(message) {
      this.enqueue('identify', message);
    }

    track(message) {
      this.enqueue('track', message);
    }

    /**
     * Add a `message` of type `type` to the queue and
     * check whether it should be flushed.
     *
     * @param {String} type
     * @param {Object} message
     */
    enqueue(type, message) {
      message = Object.assign({}, message);
      message.type = type;

      if (!message.timestamp) {
        message.timestamp = new Date();
      }

      if (!message.messageId) {
        // TODO: node implementation added md5 of message here..
        message.messageId = uuidv4();
      }

      this.queue.push(message);

      if (!this.flushed) {
        this.flushed = true;
        this.flush();
        return;
      }

      if (this.queue.length >= this.flushAt) {
        this.flush();
      }

      if (this.flushInterval && !this.timer) {
        this.timer = setTimeout(() => this.flush(), this.flushInterval);
      }
    }

    async _sendRequest(data) {
      const response = await fetch(`${this.host}/v1/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(this.writeKey + ":")
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return response;
      }

      if (response.status === 429 ||
          (response.status >= 500 && response.status < 600)) {
        // Error is retryable
        throw new Error(response.statusText);
      }

      // Abort retries.
      // throw new pRetry.AbortError(response.statusText);
    }

    async sendRequest(data) {
      this._sendRequest(data);
      // await pRetry(() => this._sendRequest(data), {
      //   retries: this.retryCount
      // });
    }

    async flush() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }

      if (!this.queue.length) {
        return;
      }

      const messages = this.queue.splice(0, this.flushAt);

      const data = {
        batch: messages,
        timestamp: new Date(),
        sentAt: new Date()
      };

      await this.sendRequest(data);
    }
  }

  // import { BRAND, VERSION } from '/lib/constants.mjs';

  const SEGMENT_API_URL = 'https://api.segment.io';
  const SEGMENT_WRITE_KEY = 'SSnR5qQW22VHmx0vtnyas25wY8JmAgPo';

  const logger$1 = new Logger('segment');

  let segmentApi;
  let segmentUserId;

  function init() {

    try {
      segmentApi = new Analytics(SEGMENT_WRITE_KEY, { host: SEGMENT_API_URL });
    } catch (e) {
      logger$1.error('init failed', e);
    }
  }

  async function trackEvent(event, properties) {
    try {
      if (!segmentUserId) {
        logger$1.debug('trying to track event without user!');
        return;
      }

      logger$1.debug(`tracking event ${event} with properties: ${JSON.stringify(properties)}`);
      if (segmentApi) {
        segmentApi.track({
          userId: segmentUserId,
          event,
          properties
        });
      }
    } catch (e) {
      logger$1.error(e);
    }
  }

  function tr(event, properties) {
    return () => trackEvent(event, properties);
  }

  const track = {
    login: tr('login'),
    callContact: tr('call_contact'),
    logout: tr('logout'),
    toggleDnd: tr('dnd_toggle'),
    updateAvailability: tr('availability_update'),
    clickedToDial: (tr('click_to_dial')) //TODO als parser geintegreerd is.

  };

  init();

  chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
      if (request.b_number) {
          let { b_number } = await clickToDial(request.b_number);
          if (b_number) {
              track.clickedToDial();
              showNotification(`calling ${b_number}`);
              sendResponse({ update: 'Trying to make the call' });
          }
      }
  });

}());
