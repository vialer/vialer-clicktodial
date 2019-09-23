let env = require('../lib/env')
const Skeleton = require('../lib/skeleton')


class CallStatusApp extends Skeleton {
    /**
    * We want to show the callstatus as soon as possible. Therefor
    * the bNumber and the initial status are already passed with
    * the opening url's query parameters.
    * @param {Object} options - Initial options to start the app with.
    */
    constructor(options) {
        super(options)
        this.logger.info(`${this}starting callstatus application`)
        // Get the callid from the opened url.
        this.bNumber = window.location.href.match(/bNumber\=([^&]+)/)[1]
        this.callid = null
        this.timerStarted = false

        let initialStatus = decodeURI(window.location.href.match(/status\=([^&]+)/)[1])

        this.setText(document.getElementById('number'), this.bNumber)
        this.setText(document.getElementById('status'), initialStatus)

        this.addListeners()
    }


    addListeners() {
        this.on('dialer:status.update', (data) => {
            // The callid is assigned on the first status update.
            if (!this.callid) this.callid = data.callid
            if (!this.timerStarted) {
                // Notify the background to start the callstatus timer.
                this.emit('dialer:status.start', {
                    // Extra info to identify call.
                    bNumber: this.bNumber,
                    callid: this.callid,
                })
                this.timerStarted = true
            }

            if (data.callid === this.callid) {
                if (data.status) {
                    this.setText(document.getElementById('status'), data.status)
                }
            }
        })

        // Close the dialog on escape. Requires the iframe to be focussed.
        $(document).keyup((e) => {
            if (e.keyCode === 27) {
                this.hideCallstatus()
            }
        })

        // The most outer bubbled event triggers closing the callstatus.
        $('body').on('click', this.hideCallstatus.bind(this))
        // Except when we click inside the callstatus dialog. In this
        // case we stop the bubbling.
        $('.callstatus .close, .callstatus').on('click', (e) => {
            e.stopPropagation()
            if ($(e.currentTarget).hasClass('close')) {
                this.hideCallstatus()
            }
        })

        $(window).on('unload', this.hideCallstatus.bind(this))
    }


    hideCallstatus() {
        this.logger.info(`${this}closing callstatus dialog`)
        // Notify the parent tab that the callstatus
        // wants to be closed.
        this.emit('dialer:status.hide', {callid: this.callid}, false, false, parent)
    }


    setText(element, text) {
        this.logger.debug(`${this}setting status text '${text}'`)
        while (element.firstChild !== null) {
            // Remove all existing content.
            element.removeChild(element.firstChild)
        }
        element.appendChild(document.createTextNode(text))
    }
}

env.role.callstatus = true
global.app = new CallStatusApp({
    environment: env,
    modules: [],
    name: 'callstatus',
})
