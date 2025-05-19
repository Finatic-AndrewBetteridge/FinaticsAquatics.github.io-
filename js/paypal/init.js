// paypal/init.js - Handles PayPal checkout button integration

function renderPayPalButton(itemTotal) {
  const container = document.getElementById('payment-options');
  container.innerHTML = '';
  if (itemTotal === 0) return;

  const email = document.getElementById('customer-email')?.value || 'unknown@example.com';
  const name = document.getElementById('customer-name')?.value || 'Customer';
  const mobile = document.getElementById('customer-mobile')?.value || 'N/A';
  const delivery = 14.99;
  const total = itemTotal + delivery;

  const orderSummary = `
Name: ${name}
Email: ${email}
Mobile: ${mobile}

${cart.map(item =>
    `${item.quantity} x ${item.fish} (${item.size}) = £${(item.quantity * item.price).toFixed(2)}`
  ).join('\n')}

Delivery: £${delivery.toFixed(2)}
Total: £${total.toFixed(2)}
`;

  const paypalDiv = document.createElement('div');
  paypalDiv.id = 'paypal-button-container';
  container.appendChild(paypalDiv);

  paypal.Buttons({
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{ amount: { value: total.toFixed(2) } }]
    }),
    onApprove: (data, actions) =>
      actions.order.capture().then(details => {
        alert('Payment complete. Thank you!');
        sendPushoverNotification(`${name} (${email}, ${mobile}) paid £${total}\n\n${orderSummary}`);
        sendEmailConfirmation(email, orderSummary);

        // Send to Google Sheets
        fetch('https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            mobile,
            fish: cart.map(i => `${i.quantity} x ${i.fish} (${i.size})`).join(', '),
            itemTotal: itemTotal.toFixed(2),
            delivery: delivery.toFixed(2),
            total: total.toFixed(2),
            paidVia: 'PayPal',
            status: 'Paid'
          })
        }).catch(err => console.error('❌ Failed to log order:', err));

        cart = [];
        localStorage.removeItem('cart');
        renderCart();
      }),
    onError: err => alert('Payment failed. Please try again.')
  }).render('#paypal-button-container');
}
