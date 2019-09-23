/**
* Simple environment detection.
*/
module.exports = (function() {
    let env = {
        isChrome: false,
        isEdge: false,
        isFirefox: false,
        isElectron: false,
        isExtension: false,
        isLinux: false,
        isOsx: false,
        isWindows: false,
        isPopout: false,
        role: {
            background: false,
            callstatus: false,
            observer: false,
            options: false,
            popout: false,
            popup: true,
            tab: false,
        }
    }
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('edge')) {
        env.isEdge = true
    } else if (ua.includes('firefox')) {
        env.isFirefox = true
    } else if (ua.includes('chrome')) {
        env.isChrome = true
    }
    
    if (navigator.platform.match(/(Linux)/i)) env.isLinux = true
    else if (navigator.platform.match(/(Mac)/i)) env.isOsx = true
    else if (navigator.platform.match(/(Windows)/i)) env.isWindows = true
    
    try {
        if ((chrome && chrome.extension) || (browser && browser.extension)) {
            env.isExtension = true
        }
    } catch(e) {
        // Catch reference errors.
    }
    
    try {
        // Skip electron from transpilation.
        let electronNamespace = 'electron'
        window.electron = require(electronNamespace)
        env.isElectron = true
    } catch (e) {
        // Catch reference errors.
    }

    return env
})()
