// import * as RemoteLogging from '/lib/remote-logging.mjs';

import { logToConsole } from '/lib/console.mjs';

const LEVELS = {
  error: 4,
  warn: 3,
  info: 2,
  verbose: 1,
  debug: 0
};

export let verbosity = 'info';

export class Logger {
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
    const verbosityIdx = LEVELS[verbosity] || 0;
    const levelIdx = LEVELS[level] || 0;
    // if (levelIdx >= verbosityIdx) {
      logToConsole(level, this.module, message, ...args);
    // }
    // TODO later remote logging toevoegen
    // RemoteLogging.enqueueMessage(level, this.module, message, ...args);
  }
}

