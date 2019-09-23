/**
* @module Availability
*/
class AvailabilityModule {

    /**
    * @param {ClickToDialApp} app - The application object.
    */
    constructor(app) {
        this.app = app
        this.hasUI = true
        this.app.modules.availability = this

        this.addListeners()
    }


    addListeners() {
        /**
         * Update availability by calling the API, then emit
         * to the popup that the choices need to be updated.
         */
        this.app.on('availability.update', (data) => {
            this.app.logger.debug(`${this}update selected userdestination and refresh popup`)
            this.selectUserdestination(data.type, data.id)
            this.app.emit('availability:refresh')
        })
    }


    /**
    * Build an array of availability data that can be used to build
    * the availability select.
    * @param {Object} userdestination - Contains available phoneaccounts and
    * fixeddestinations to build the availability list from.
    * @param {String} selectedFixeddestinationId - Fixeddestination to select.
    * @param {String} selectedPhoneaccountId - Phoneaccount to select.
    * @returns {Array} - Data that is used to build the select element with.
    */
    availabilityOptions(userdestination, selectedFixeddestinationId, selectedPhoneaccountId) {
        this.app.logger.info(
            `${this}availabilityOptions selected [${selectedFixeddestinationId}, ${selectedPhoneaccountId}]`)
        // Destinations choices.
        const fixeddestinations = userdestination.fixeddestinations
        const phoneaccounts = userdestination.phoneaccounts

        let options = []
        fixeddestinations.forEach((fixeddestination) => {
            let option = {
                label: `${fixeddestination.phonenumber}/${fixeddestination.description}`,
                value: `fixeddestination-${fixeddestination.id}`,
            }
            if (parseInt(fixeddestination.id) === parseInt(selectedFixeddestinationId)) {
                this.app.logger.debug(`${this}set selected fixeddestination ${selectedFixeddestinationId}`)
                option.selected = true
            }
            // Add fixed destination to options.
            options.push(option)
        })
        phoneaccounts.forEach((phoneaccount) => {
            let option = {
                label: `${phoneaccount.internal_number}/${phoneaccount.description}`,
                value: `phoneaccount-${phoneaccount.id}`,
            }
            if (parseInt(phoneaccount.id) === parseInt(selectedPhoneaccountId)) {
                this.app.logger.debug(`${this}set selected phoneaccount ${selectedPhoneaccountId}`)
                option.selected = true
            }
            // Add phone account to options.
            options.push(option)
        })

        return options
    }


    selectUserdestination(type, id) {
        let data = {
            fixeddestination: null,
            phoneaccount: null,
        }
        if (type) data[type] = id

        // Save selection.
        let selectedUserdestinationId = this.app.store.get('user').selectedUserdestinationId

        this.app.api.client.put(`api/selecteduserdestination/${selectedUserdestinationId}/`, data).then((res) => {
            if (this.app.api.OK_STATUS.includes(res.status)) {
                this.app.logger.info(`${this}changed selected userdestination api request ok`)

                // Set an icon depending on whether the user is available.
                let icon = 'img/icon-menubar-unavailable.png'
                if (id) {
                    icon = 'img/icon-menubar-active.png'
                }
                let widgetState = this.app.store.get('widgets')
                widgetState.availability.icon = icon
                this.app.store.set('widgets', widgetState)

                if (this.app.env.isExtension) {
                    if (widgetState.queues && !widgetState.queues.selected) {
                        browser.browserAction.setIcon({path: icon})
                    }
                }

                let userData = this.app.store.get('user')
                userData.userdestination.selecteduserdestination.fixeddestination = data.fixeddestination
                userData.userdestination.selecteduserdestination.phoneaccount = data.phoneaccount
                this.app.store.set('user', userData)
            } else if (this.app.api.NOTOK_STATUS.includes(res.status)) {
                this._restore()
            }
        })
    }


    /**
    * Enable or disable the availability select based on the
    * `Are you available` radio button value.
    */
    toggleAvailabilitySelect() {
        const isAvailable = $('.availability-toggle [name="availability"]:checked').val() === 'yes'
        if (isAvailable) {
            this.app.logger.debug(`${this}user is available`)
            $('select#statusupdate').prop('disabled', false)
        } else {
            this.app.logger.debug(`${this}user is not available`)
            $('select#statusupdate').prop('disabled', true)
        }
    }


    toString() {
        return `${this.app}[availability] `
    }


    /**
    * Do an API request to get an update of the available userdestination
    * options when the module is loaded in the background.
    */
    _load() {
        this.app.api.client.get('api/userdestination/').then((res) => {
            this.app.emit('ui:widget.reset', {name: 'availability'})
            if (this.app.api.OK_STATUS.includes(res.status)) {
                this.app.emit('availability:reset')
                // There is only one userdestination so objects[0] is the right
                // (and only) one.
                let userdestination = res.data.objects[0]
                let userData = this.app.store.get('user')
                if (userData) {
                    // Save userdestination in storage.
                    userData.userdestination = userdestination
                    // Save id for reference when changing the userdestination.
                    userData.selectedUserdestinationId = userdestination.selecteduserdestination.id
                    this.app.store.set('user', userData)
                }

                // Currently selected destination.
                let selectedFixeddestinationId = userdestination.selecteduserdestination.fixeddestination
                let selectedPhoneaccountId = userdestination.selecteduserdestination.phoneaccount

                // Build options for the availability dropdown.
                let options = this.availabilityOptions(userdestination, selectedFixeddestinationId,
                    selectedPhoneaccountId)

                let widgetState = this.app.store.get('widgets')
                widgetState.availability.options = options
                widgetState.availability.unauthorized = false
                this.app.store.set('widgets', widgetState)

                // Fill the dropdown with these choices.
                if (options.length) {
                    this.app.emit('availability:fill_select', {destinations: options})
                }

                // Set an icon depending on whether the user is available.
                let icon = 'img/icon-menubar-unavailable.png'
                if (selectedFixeddestinationId || selectedPhoneaccountId) {
                    icon = 'img/icon-menubar-active.png'
                }
                this.app.logger.info(`${this}setting icon ${icon}`)

                if (this.app.env.isExtension) {
                    if (!widgetState.queues.selected) {
                        browser.browserAction.setIcon({path: icon})
                    }
                }

                // Save icon in storage.
                widgetState.availability.icon = icon
                this.app.store.set('widgets', widgetState)
            } else if (this.app.api.UNAUTHORIZED_STATUS.includes(res.status)) {
                this.app.logger.warn(`${this}unauthorized availability request`)
                // Update authorization status in the store.
                let widgetState = this.app.store.get('widgets')
                widgetState.availability.unauthorized = true
                this.app.store.set('widgets', widgetState)

                // Display an icon explaining the user lacks permissions to use
                // this feature of the plugin.
                this.app.emit('ui:widget.unauthorized', {name: 'availability'})
            }
        })
    }


    _reset() {
        this.app.emit('availability:reset')
        this.app.logger.info(`${this}set icon to grey`)
        if (this.app.env.isExtension) browser.browserAction.setIcon({path: 'img/icon-menubar-inactive.png'})
    }


    /**
    * This is called when the popup refreshes and the background already
    * has processed all availability data.
    */
    _restore() {
        // Check if unauthorized.
        const widgetState = this.app.store.get('widgets')
        if (widgetState && widgetState.availability.unauthorized) {
            this.app.emit('ui:widget.unauthorized', {name: 'availability'})
            return
        }

        // Restore options.
        const userData = this.app.store.get('user')
        if (userData && userData.userdestination) {
            const userdestination = userData.userdestination
            const selectedFixeddestinationId = userdestination.selecteduserdestination.fixeddestination
            const selectedPhoneaccountId = userdestination.selecteduserdestination.phoneaccount
            this.app.logger.debug(
                `${this}restoring availability options from ${selectedPhoneaccountId}/${selectedFixeddestinationId}`)
            const options = this.availabilityOptions(userdestination, selectedFixeddestinationId,
                selectedPhoneaccountId)
            this.app.emit('availability:reset')
            if (options.length) {
                this.app.emit('availability:fill_select', {destinations: options})
            }
        }

        // Restore icon.
        if (widgetState && widgetState.availability.icon) {
            if (!widgetState.queues.selected) {
                this.app.logger.info(`${this}set availability icon`)
                if (this.app.env.isExtension) {
                    browser.browserAction.setIcon({path: widgetState.availability.icon})
                }
            }
        }

        // Restore availability.
        this.app.emit('availability:refresh')
    }
}

module.exports = AvailabilityModule
