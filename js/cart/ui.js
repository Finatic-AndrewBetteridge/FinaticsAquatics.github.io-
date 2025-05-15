// cart/ui.js - Renders the cart view and triggers PayPal

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.quantity * item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.quantity} x ${item.fish} (${item.size}) — £${subtotal} <button data-index="${i}" class="remove-btn">Remove</button>`;
    cartItems.appendChild(li);
    total += subtotal;
  });

  cartTotal.textContent = total > 0 ? `Total: £${total}` : '';
  saveCart();
  updateCartIcon();
  renderPayPalButton(total);
}
