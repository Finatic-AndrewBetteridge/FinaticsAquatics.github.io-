// cart/controls.js - Handles cart control buttons

document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) {
    clearBtn.onclick = () => {
      cart = [];
      saveCart();
      renderCart();
    };
  }

  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
      const index = parseInt(e.target.dataset.index);
      if (!isNaN(index)) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      }
    }
  });
});
