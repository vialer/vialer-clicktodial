// Based on: https://github.com/segmentio/analytics-node
// Translated nodejs to a minimal browser implementation.

import { uuidv4 } from "../utils/crypto.mjs";
// import pRetry from 'p-retry';

export class Analytics {
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
    this.host = options.host || "https://api.segment.io";
    this.timeout = options.timeout || false;
    this.flushAt = Math.max(options.flushAt, 1) || 20;
    this.flushInterval = options.flushInterval || 10000;
    this.flushed = false;
    this.retryCount = options.retryCount || 3;
  }

  identify(message) {
    this.enqueue("identify", message);
  }

  track(message) {
    this.enqueue("track", message);
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(this.writeKey + ":")
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      return response;
    }

    if (
      response.status === 429 ||
      (response.status >= 500 && response.status < 600)
    ) {
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
