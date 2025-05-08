// js/main.js

const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';
let stockData = {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function fetchStock() {
  fetch(sheetUrl)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Invalid data format from backend");

      const grouped = {};
      data.forEach(item => {
        const {
          fishName,
          size,
          price,
          stock,
          type = 'Uncategorized',
          category = 'General',
          subcategory = '',
          subcategory2 = '',
          subcategory3 = ''
        } = item;

        const path = [type, category, subcategory, subcategory2, subcategory3].filter(Boolean);
        const key = path.join(' > ');
        if (!grouped[key]) grouped[key] = {};
        if (!grouped[key][fishName]) grouped[key][fishName] = [];
        grouped[key][fishName].push({ size, price, stock });
      });

      stockData = grouped;
      const grid = document.getElementById('fish-grid');
      grid.innerHTML = '';
      const sectionMap = {};

      Object.keys(stockData).sort().forEach(path => {
        const sectionId = path.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        if (!sectionMap[sectionId]) {
          const section = document.createElement('section');
          section.id = sectionId;
          const heading = document.createElement('h2');
          heading.textContent = path;
          section.appendChild(heading);
          const fishList = document.createElement('div');
          fishList.className = 'fish-grid';
          section.appendChild(fishList);
          grid.appendChild(section);
          sectionMap[sectionId] = fishList;
        }

        const fishEntries = stockData[path];
        for (const fish in fishEntries) {
          const items = fishEntries[fish];
          if (!Array.isArray(items)) continue;

          const card = document.createElement('div');
          card.className = 'fish-card';

          const mediaWrapper = document.createElement('div');
          mediaWrapper.className = 'fish-media-wrapper';

          const baseName = fish.toLowerCase().replace(/\s+/g, '-');

          const img = document.createElement('img');
          img.src = `images/${baseName}.jpg`;
          img.alt = fish;
          img.onerror = () => {
            img.onerror = null;
            img.src = `images/${baseName}.png`;
            img.onerror = () => {
              img.src = 'images/fallback.png';
            };
          };

          const video = document.createElement('video');
          video.src = `images/${baseName}.mov`;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.style.display = 'none';

          mediaWrapper.appendChild(img);
          mediaWrapper.appendChild(video);
          card.appendChild(mediaWrapper);

          // Hover logic to show video
          mediaWrapper.addEventListener('mouseenter', () => {
            img.style.display = 'none';
            video.style.display = 'block';
            video.play();
          });
          mediaWrapper.addEventListener('mouseleave', () => {
            video.style.display = 'none';
            img.style.display = 'block';
            video.pause();
            video.currentTime = 0;
          });

          const title = document.createElement('h3');
          title.textContent = fish;
          card.appendChild(title);

          const selector = document.createElement('div');
          selector.className = 'selector';

          const sizeSelect = document.createElement('select');
          sizeSelect.style.width = '200px';
          sizeSelect.innerHTML = '<option value="">Choose a size</option>';
          items.forEach(entry => {
            if (entry.stock === 0) return;
            const opt = document.createElement('option');
            opt.value = JSON.stringify(entry);
            opt.textContent = `${entry.size} — £${entry.price} — Stock: ${entry.stock}`;
            sizeSelect.appendChild(opt);
          });

          const qtyInput = document.createElement('input');
          qtyInput.type = 'number';
          qtyInput.min = '1';
          qtyInput.value = '1';
          qtyInput.placeholder = 'Qty';

          const addBtn = document.createElement('button');
          addBtn.textContent = 'Add to Cart';
          addBtn.addEventListener('click', () => {
            const selected = sizeSelect.value;
            const quantity = parseInt(qtyInput.value);
            if (!selected || isNaN(quantity) || quantity < 1) {
              alert('Please select a size and quantity.');
              return;
            }
            const { size, price } = JSON.parse(selected);
            cart.push({ fish, size, quantity, price });
            renderCart();
          });

          selector.appendChild(sizeSelect);
          selector.appendChild(qtyInput);
          selector.appendChild(addBtn);
          card.appendChild(selector);
          sectionMap[sectionId].appendChild(card);
        }
      });

      const loadingEl = document.getElementById('loading');
      if (loadingEl) loadingEl.style.display = 'none';

      renderCart();
    })
    .catch(err => {
      console.error('Failed to fetch stock:', err);
    });
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';
  let totalAmount = 0;

  cart.forEach((item, index) => {
    const subtotal = item.quantity * item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.quantity} x ${item.fish} (${item.size}) — £${subtotal} <button data-index="${index}" class="remove-btn" style="margin-left: 10px; background-color: #e63946; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Remove</button>`;
    cartItems.appendChild(li);
    totalAmount += subtotal;
  });

  cartTotal.textContent = totalAmount > 0 ? `Total: £${totalAmount}` : '';
  localStorage.setItem('cart', JSON.stringify(cart));

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'));
      cart.splice(index, 1);
      renderCart();
    });
  });
}

function updateOrderSummaryField() {
  let totalAmount = 0;
  const orderSummary = cart.map(item => {
    const subtotal = item.quantity * item.price;
    totalAmount += subtotal;
    return `${item.quantity} x ${item.fish} (${item.size}) — £${subtotal}`;
  }).join('\n');
  const fullSummary = `${orderSummary}\n\nTotal: £${totalAmount}`;
  const orderInput = document.getElementById('order-summary');
  if (orderInput) orderInput.value = fullSummary;
}

function appendDeliveryToURL() {
  const form = document.getElementById('order-form');
  const delivery = document.getElementById('delivery').value;
  form.action += `?delivery=${encodeURIComponent(delivery)}`;
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  fetchStock();
  const clearCartBtn = document.getElementById('clear-cart');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      cart.length = 0;
      localStorage.removeItem('cart');
      document.getElementById('cart-items').innerHTML = '';
      document.getElementById('cart-total').textContent = '';
    });
  }
});
