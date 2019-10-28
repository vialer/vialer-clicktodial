
chrome.runtime.onMessage.addListener(
    function (message, callback) {
        if (message == "runContentScript") {
            chrome.tabs.executeScript({
                file: 'contentScript.js'
            });
        }
    });
    // https://developer.chrome.com/extensions/content_scripts#registration