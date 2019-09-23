let registeredTimers = {}

/**
* Calculate a jitter from interval.
* @param {Number} interval - The interval in ms to calculate jitter for.
* @param {Number} percentage - The jitter range in percentage.
* @returns {Number} The calculated jitter in ms.
*/
function jitter(interval, percentage) {
    let min = 0 - Math.ceil(interval * (percentage / 100))
    let max = Math.floor(interval * (percentage / 100))
    return Math.floor(Math.random() * (max - min)) + min
}


/**
* This timer keeps track of all used timers inside this plugin and can
* clear, start or change the timeout of these timers at any time.
*/
class Timer {

    constructor(app) {
        this.app = app
        this.registeredTimers = registeredTimers
    }

    getRegisteredTimer(timerId) {
        if (registeredTimers.hasOwnProperty(timerId)) {
            return registeredTimers[timerId]
        }

        return null
    }


    /**
    * This doubles the retry interval in each run and adds jitter.
    * @param {object} retry - The reference retry object.
    * @returns {object} The updated retry object.
    */
    increaseTimeout(retry) {
        // Make sure that interval doesn't go past the limit.
        if (retry.interval * 2 < retry.limit) {
            retry.interval = retry.interval * 2
        } else {
            retry.interval = retry.limit
        }

        retry.timeout = retry.interval + jitter(retry.interval, 30)
        if (this.app.verbose) this.app.logger.debug(`${this}increase timeout to '${retry.timeout}'`)
        return retry
    }


    registerTimer(timerId, timerFunction) {
        this.app.logger.debug(`${this}register timer ${timerId}`)
        registeredTimers[timerId] = {
            function: timerFunction,
            interval: null, // interval in miliseconds
            reset: false,
            // References to timer objects to be able to clear it later.
            timeout: null, // timeout in miliseconds
            timer: {
                interval: null,
                timeout: null,
            },
        }
    }


    unregisterTimer(timerId) {
        if (this.getRegisteredTimer(timerId)) {
            delete registeredTimers[timerId]
        }
    }


    setInterval(timerId, interval) {
        if (this.getRegisteredTimer(timerId)) {
            registeredTimers[timerId].interval = interval
        }
    }


    /**
    * @param {String} timerId - Find the timer by it's unique identifier.
    * @param {Number|Function} timeout - A timeout or function that returns a timeout.
    * @param {Boolean} reset - Whether to rerun the timer function after *timeout* and resolving the timer function.
    */
    setTimeout(timerId, timeout, reset) {
        this.app.logger.debug(`${this}set timeout for ${timerId}`)
        if (this.getRegisteredTimer(timerId)) {
            registeredTimers[timerId].timeout = timeout
            // *reset* indicates whether to re-run *timerFunction* after
            // *timeout* miliseconds it finished
            registeredTimers[timerId].reset = reset
        }
    }


    startTimer(timerId) {
        if (!this.getRegisteredTimer(timerId)) return

        let timerFunction = registeredTimers[timerId].function

        if (registeredTimers[timerId].interval) {
            registeredTimers[timerId].timer.interval = setInterval(timerFunction, registeredTimers[timerId].interval)
            this.app.logger.debug(`${this}start interval timer ${timerId} with id ${registeredTimers[timerId].timer.interval}`)
        }

        let timeout = registeredTimers[timerId].timeout
        if (typeof timeout === 'function') timeout = timeout()

        if (timeout) {
            if (registeredTimers[timerId].reset) {
                let resetFunction = async() => {
                    // The timer function should return a Promise, so the next
                    // timer will start with a new timeout AFTER the
                    // previous one is resolved.
                    await timerFunction()
                    // Determine the new dynamic timeout once the
                    // timer function is finished.
                    let _timeout = registeredTimers[timerId].timeout
                    if (typeof _timeout === 'function') _timeout = _timeout()

                    // Only repeat the timer function when the timeout is
                    // not false-like (not 0).
                    if (_timeout) {
                        this.stopTimer(timerId)
                        registeredTimers[timerId].timer.timeout = setTimeout(resetFunction, _timeout)
                    }
                }
                this.stopTimer(timerId)
                registeredTimers[timerId].timer.timeout = setTimeout(resetFunction, timeout)
            } else {
                this.stopTimer(timerId)
                registeredTimers[timerId].timer.timeout = setTimeout(timerFunction, timeout)
            }
        }
        if (this.app.verbose) this.app.logger.debug(`${this}start timer ${timerId} with timeout ${timeout}`)
    }


    stopTimer(timerId) {
        if (this.getRegisteredTimer(timerId)) {
            if (registeredTimers[timerId].timer.interval) {
                this.app.logger.debug(`${this}clearing interval timer ${timerId}`)
                clearInterval(registeredTimers[timerId].timer.interval)
                registeredTimers[timerId].timer.interval = null
            }
            if (registeredTimers[timerId].timer.timeout) {
                if (this.app.verbose) this.app.logger.debug(`${this}clearing timeout timer ${timerId}`)
                clearTimeout(registeredTimers[timerId].timer.timeout)
                registeredTimers[timerId].timer.timeout = null
            }
        } else {
            this.app.logger.debug(`${this}no such timer: ${timerId}`)
        }
    }


    stopAllTimers() {
        for (const timerId of Object.keys(this.registeredTimers)) {
            this.app.logger.debug(`${this}remove remaining timer '${timerId}'`)
            this.stopTimer(timerId)
        }
    }


    toString() {
        return `${this.app}[timer] `
    }


    update(timerId) {
        if (timerId) {
            this.startTimer(timerId)
        } else {
            for (timerId in registeredTimers) {
                this.startTimer(timerId)
            }
        }
    }
}


module.exports = Timer
