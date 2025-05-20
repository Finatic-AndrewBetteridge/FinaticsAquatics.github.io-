// cart/state.js - Cart state & floating icon logic

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartIcon() {
  const cartIcon = document.getElementById('floating-cart');
  if (!cartIcon) return;

  const total = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  cartIcon.innerHTML = `
    <span id="cart-count" style="background:red;color:white;padding:2px 6px;border-radius:10px;margin-right:6px;font-size:0.9em;">${count}</span>
    🛒 Cart: £${total.toFixed(2)}
  `;
}
