// cart/ui.js - Renders the cart view and triggers PayPal

document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const paymentContainer = document.getElementById('payment-options');

  if (!cartItems || !cartTotal || !paymentContainer) return;

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.quantity * item.price;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>\${item.fish} (\${item.size}) — £\${item.price} x </span>
      <input type="number" min="1" value="\${item.quantity}" data-index="\${i}" class="qty-input" style="width: 50px; margin: 0 0.5rem;">
      <span>= £\${subtotal}</span>
      <button data-index="\${i}" class="remove-btn">Remove</button>
    `;
    cartItems.appendChild(li);
    total += subtotal;
  });

  // Attach quantity update listeners
  cartItems.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const qty = parseInt(e.target.value);
      if (!isNaN(qty) && qty > 0 && cart[index]) {
        cart[index].quantity = qty;
        saveCart();
        renderCart();
      }
    });
  });

  // Attach remove buttons
  cartItems.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      if (!isNaN(index)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      }
    });
  });

  if (cart.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = '🛒 Your cart is empty.';
    msg.style.fontWeight = 'bold';
    cartItems.appendChild(msg);
  }

  cartTotal.textContent = total > 0 ? `Total: £\${total.toFixed(2)}` : '';

  saveCart();
  updateCartIcon();

  const name = document.getElementById('customer-name')?.value.trim();
  const email = document.getElementById('customer-email')?.value.trim();
  const mobile = document.getElementById('customer-mobile')?.value.trim();

  paymentContainer.innerHTML = '';

  if (typeof renderPayPalButton === 'function') {
    if (name && email && mobile) {
      renderPayPalButton(total);
    } else {
      const msg = document.createElement('p');
      msg.style.color = 'red';
      msg.style.fontWeight = 'bold';
      msg.textContent = 'Please complete name, email, and mobile to continue to checkout.';
      paymentContainer.appendChild(msg);
    }
  }

  ['customer-name', 'customer-email', 'customer-mobile'].forEach(id => {
    const field = document.getElementById(id);
    if (field && !field.dataset.listenerAttached) {
      field.addEventListener('input', () => {
        renderCart();
      });
      field.dataset.listenerAttached = 'true';
    }
  });
}
