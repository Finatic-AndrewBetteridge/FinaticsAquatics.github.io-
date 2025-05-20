// init.js - Initializes the Finatics Aquatics app on page load

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'block';

  fetchStock()
    .then(() => {
      if (loading) loading.style.display = 'none';
    })
    .catch(err => {
      console.error('❌ Error during stock fetch:', err);
      if (loading) loading.textContent = 'Failed to load fish stock.';
    });

  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) {
    clearBtn.onclick = () => {
      cart = [];
      saveCart();
      renderCart();
    };
  }

  const search = document.createElement('input');
  search.placeholder = 'Search fish...';
  search.className = 'fish-search';
  search.addEventListener('input', e => {
    renderFishGrid(e.target.value);
    const noResults = document.getElementById('no-fish-message');
    if (noResults) noResults.remove();

    if (document.querySelectorAll('.fish-card').length === 0) {
      const msg = document.createElement('p');
      msg.id = 'no-fish-message';
      msg.textContent = 'No fish found.';
      msg.style.fontWeight = 'bold';
      msg.style.marginTop = '1em';
      document.getElementById('fish-grid').appendChild(msg);
    }
  });

  const grid = document.getElementById('fish-grid');
  if (grid) grid.before(search);

  if (!document.getElementById('floating-cart')) {
    const cartIcon = document.createElement('div');
    cartIcon.id = 'floating-cart';
    cartIcon.innerHTML = `
      <span id="cart-count" style="background:red;color:white;padding:2px 6px;border-radius:10px;margin-right:6px;font-size:0.9em;">0</span>
      🛒 Cart: £0.00
    `;
    Object.assign(cartIcon.style, {
      position: 'fixed',
      top: '1em',
      right: '1em',
      background: '#0077cc',
      color: 'white',
      padding: '0.5em 1em',
      borderRadius: '25px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      zIndex: 1000,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center'
    });
    cartIcon.onclick = () => {
      window.location.href = 'cart.html';
    };
    document.body.appendChild(cartIcon);
  }

  updateCartIcon();
});
