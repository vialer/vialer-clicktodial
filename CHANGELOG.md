# Changelog

## Version 2.2.1
* Added two-factor authentication.

## Version 2.2.0
* Fix for click2dial icons being disabled by default
* Analytics tracking code per build target. Fixes Firefox analytics not showing any activity anymore.
* Telemetry opt-in modal and option in settings page. Fixes amo-editor issue for Firefox.
* Custom analytics data and beacon request instead of script injection. Fixes amo-editor issue for Firefox.
* Fix call number contextmenu registered multiple times.
* Cleanup analytics/telemetry code. Added telemetry opt-in event.

## Version 2.1.0
* Replaced SipML5 with SIP.js. This should fix reoccuring connectivity issues and will make it easier to implement SIP register.
* Restructered JavaScript project files and build. This makes it easier for developers to understand and find the appropriate code.
* Several fixes and improvements for multi-brand deployment. This makes it easier to deploy a new version for multiple brands at once.
* Cleanup button-logic, added generic state-handler for it. Button in settings and for login now use the same state handling.
* Added branding colors to buttons and popup widget header. Login and Save button in options now show in branded colors.
* Chrome has a CSS animation for collapse/expand popup accordeon.
* Remember email address between sessions.
* Fix for autologin url token. Fixes an edge-case where the settings page was incorrectly opened.

## Version 2.0.17
* [108](https://github.com/VoIPGRID/vialer-js/issues/108) Changed event-based reconnection mechanism to
  scheduler-based to address reconnection issue.
* [110](https://github.com/VoIPGRID/vialer-js/issues/110) Added branded build and deployment. Added beta deployments.

## Version 2.0.16
* Tweak websocket reconnection issue

## Version 2.0.15
* Fix invalid call to modules.

## Version 2.0.14
* Fixed websocket reconnection issue.

## Version 2.0.13
* [101](https://github.com/VoIPGRID/vialer-js/issues/101): Add db schema check to account for old localstorage data.
  User will automatically be logged out if the db schema in the application doesn't match with the one in localstorage.
  Also does a better property check on contacts list, notifications and queues list.

## Version 2.0.12
* The name and branding of the Click-to-dial/VoIPGRID  browser plugin has been changed to Vialer
* Presence information is synced more reliably to the UI
* Cleaned up styling, improved styling consistency, new icons and Roboto font
* Styled settings page
* Automatic logout after changing platform url when logged in
* Cleaned up popout view, changed flexbox layout
* Changing the platform url while being logged in, will show a warning and log the user out after save
* Queues list will show an empty list initially
* Queue updates are done with 1 API call instead of 1 request per queue
* Cleaned up callstatus status poller and notifications. Notification and Callstatus now inform earlier on
* Callstatus iframe now takes the whole page width/height. Not possible to click on items behind the overlay anymore
* Repeated timer functions are now handled async
* Widget open state is not affected anymore by refreshing the popout
* Disable call options when a call is in progress
* Phone icon used in context menu
* Popout favicon forced to Vialer logo (Firefox doesn't have a logo there)
* Fix opacity notification icon
* A red notification icon is used when a call fails

Changes invisible to users:
* Refactored codebase
* Rewrote to use chrome namespace; plugin can now be deployed as Firefox and Chrome plugin
* Improved logging
* Simplified Eventemitter API to deal with IPC messaging
* Experimental Electron build
* Gulp buildsystem, simplified development and deployment
* The repository has been changed to https://github.com/VoIPGRID/vialer-js
