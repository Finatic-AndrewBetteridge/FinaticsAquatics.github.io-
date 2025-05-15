// notifications/email.js

function sendEmailConfirmation(email, summary) {
  fetch(formspreeEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message: summary })
  }).catch(console.error);
}
