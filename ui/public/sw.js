self.addEventListener('install', function(event) {
  event.waitUntil(
    self.skipWaiting()
  );
});

self.addEventListener('activate', function(event) {
  console.log('I AM SERVICE WORKER')
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener('click', function(event) {
  console.log('CLICK HEARD')
  // Check if user has granted notification permission

});

function sendNotification() {
  if (Notification.permission === 'granted') {
    // Send notification
    setTimeout(() => {
    self.registration.showNotification('Button Clicked!', {
      body: 'This notification was triggered from a button press.',
      icon: 'icon.png' // Replace with path to your notification icon
    });
  }, 5000)
  } 
}

self.addEventListener('message', function(event) {
  console.log(event.data)
  if (event.data.type === 'buttonClicked') {
    sendNotification()
    // Handle button click event here (e.g., show notification)
    // ... your service worker logic ...
  }
});
