export function showNotification(title) {
  var options = {
    silent: true
  };
  let notification = new Notification(title, options);
}
