// paypal/init.js - Sets up and renders PayPal button

function renderPayPalButton(totalAmount) {
  const container = document.getElementById('payment-options');
  container.innerHTML = '';
  if (totalAmount === 0) return;

  const email = document.getElementById('customer-email').value || 'unknown@example.com';
  const name = document.getElementById('customer-name').value || 'Customer';

  const orderSummary = cart.map(item =>
    `${item.quantity} x ${item.fish} (${item.size}) = £${item.quantity * item.price}`
  ).join('\n') + `\nTotal: £${totalAmount}`;

  const paypalDiv = document.createElement('div');
  paypalDiv.id = 'paypal-button-container';
  container.appendChild(paypalDiv);

  paypal.Buttons({
    createOrder: (data, actions) => actions.order.create({
      purchase_units: [{ amount: { value: totalAmount.toFixed(2) } }]
    }),
    onApprove: (data, actions) =>
      actions.order.capture().then(() => {
        alert('Payment complete. Thank you!');
        sendPushoverNotification(`${name} (${email}) paid £${totalAmount}\n\n${orderSummary}`);
        sendEmailConfirmation(email, orderSummary);
        cart = [];
        saveCart();
        renderCart();
      }),
    onError: err => alert('Payment failed. Please try again.')
  }).render('#paypal-button-container');
}
