self.addEventListener('message', function(event) {
    var data = event.data;

    if (data.command == "oneWayCommunication") {
        console.log("Message from the Page : ", data.message);
    } 
});

// Service worker registratie
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js')
//         .then((reg) => {
//             // registration worked
//             console.log('Registration succeeded. Scope is ' + reg.scope);
//         }).catch((error) => {
//             // registration failed
//             console.log('Registration failed with ' + error);
//         });
// }
