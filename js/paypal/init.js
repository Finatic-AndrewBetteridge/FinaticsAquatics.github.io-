// paypal/init.js - Handles PayPal checkout button integration

function renderPayPalButton(totalAmount) {
  const container = document.getElementById('payment-options');
  container.innerHTML = '';
  if (totalAmount === 0) return;

  const email = document.getElementById('customer-email')?.value || 'unknown@example.com';
  const name = document.getElementById('customer-name')?.value || 'Customer';
  const mobile = document.getElementById('customer-mobile')?.value || 'N/A';
  const delivery = 14.99;

  const orderSummary = `
Name: ${name}
Email: ${email}
Mobile: ${mobile}

${cart.map(item =>
    `${item.quantity} x ${item.fish} (${item.size}) = £${(item.quantity * item.price).toFixed(2)}`
  ).join('\n')}

Delivery: £${delivery.toFixed(2)}
Total: £${totalAmount.toFixed(2)}
`;

  const paypalDiv = document.createElement('div');
  paypalDiv.id = 'paypal-button-container';
  container.appendChild(paypalDiv);

  paypal.Buttons({
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{ amount: { value: totalAmount.toFixed(2) } }]
    }),
    onApprove: (data, actions) =>
      actions.order.capture().then(details => {
        alert('Payment complete. Thank you!');
        sendPushoverNotification(`${name} (${email}, ${mobile}) paid £${totalAmount}\n\n${orderSummary}`);
        sendEmailConfirmation(email, orderSummary);
        cart = [];
        localStorage.removeItem('cart');
        renderCart();
      }),
    onError: err => alert('Payment failed. Please try again.')
  }).render('#paypal-button-container');
}
