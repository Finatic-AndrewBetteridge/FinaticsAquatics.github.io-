// notifications/pushover.js

function sendPushoverNotification(summary) {
  fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token: pushoverToken,
      user: pushoverUser,
      title: 'New Finatics Order!',
      message: summary.substring(0, 512)
    })
  }).catch(err => console.error('Pushover error:', err));
}
