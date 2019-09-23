/**
* The Dialer module. It takes care of actually dialing a phonenumber and
* updating the status about a call.
* @module Dialer
*/
class DialerModule {

    constructor(app) {
        this.app = app
        this.addListeners()
    }


    addListeners() {
        /**
         * Trigger showing the callstatus dialog.
         */
        this.app.on('dialer:status.show', (data) => {
            this.showCallstatus(data.bNumber, data.status)
        })

        // The callstatus iframe informs the tab that
        // it has to be closed.
        this.app.on('dialer:status.hide', (data) => {
            // Re-enable the Vialer icons in the tab again.
            $('.vialer-icon').each((i, el) => {
                $(el).attr('disabled', false)
            })

            $(this.frame).remove()
            delete this.frame
            // Notify the background to stop any timer that
            // may still be running.
            this.app.emit('dialer:status.onhide', data)
        })
    }


    /**
    * A tab triggers this function to show a status dialog.
    * @param {String} bNumber - Pass it asap to the callstatus page.
    * @param {String} status - Pass the initial status to the callstatus page.
    */
    showCallstatus(bNumber, status) {
        // Inline style for the injected callstatus iframe.
        let iframeStyle = {
            height: '100vh',
            left: '0',
            position: 'fixed',
            top: '0',
            width: '100vw',
            'z-index': '2147483647',
        }

        this.frame = $('<iframe>', {
            scrolling: false,
            src: browser.runtime.getURL(`webext_callstatus.html?bNumber=${bNumber}&status=${status}`),
            style: (function() {
                // Can't set !important with
                // .css("property", "value !important"),
                // so build a string to use as style.
                let style = ''
                for (let property in iframeStyle) {
                    style += `${property}: ${iframeStyle[property]} !important; `
                }
                return style
            }()),
        })

        $(this.frame).hide().on('load', (e) => {
            // Show and focus the callstatus iframe after loading.
            $(this.frame).show().get(0).contentWindow.focus()
        })
        $('html').append(this.frame)
    }
}

module.exports = DialerModule
