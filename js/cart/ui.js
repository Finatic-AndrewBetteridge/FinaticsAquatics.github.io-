// cart/ui.js - Renders the cart view and triggers PayPal

document.addEventListener('DOMContentLoaded', renderCart);

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.quantity * item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.quantity} x ${item.fish} (${item.size}) — £${subtotal} <button data-index="${i}" class="remove-btn">Remove</button>`;
    cartItems.appendChild(li);
    total += subtotal;

    li.querySelector('.remove-btn').addEventListener('click', () => {
      cart.splice(i, 1);
      saveCart();
      renderCart();
    });
  });

  if (cart.length === 0) {
    const msg = document.createElement('p');
    msg.textContent = '🛒 Your cart is empty.';
    msg.style.fontWeight = 'bold';
    cartItems.appendChild(msg);
  }

  cartTotal.textContent = total > 0 ? `Total: £${total.toFixed(2)}` : '';

  saveCart();
  updateCartIcon();

  const paymentContainer = document.getElementById('payment-options');
  if (paymentContainer && typeof renderPayPalButton === 'function') {
    renderPayPalButton(total);
  }
}
