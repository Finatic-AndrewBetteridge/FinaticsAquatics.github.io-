// Enhanced main.js with styling, lazy loading, and search functionality

const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';
const pushoverToken = 'aw5814unpeck3oz59f4q9xucs8y3as';
const pushoverUser = 'u919vjqcq2q4n8g9jto2pns6ctjiew';
let stockData = {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function sendPushoverNotification(summary) {
  fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token: pushoverToken,
      user: pushoverUser,
      title: 'New Finatics Order!',
      message: summary.substring(0, 512)
    })
  })
  .then(res => res.ok ? console.log('Pushover sent') : console.error('Pushover failed'))
  .catch(err => console.error('Pushover error:', err));
}

function fetchStock() {
  fetch(sheetUrl)
    .then(response => response.json())
    .then(data => {
      if (!Array.isArray(data)) throw new Error("Invalid data format from backend");

      const grouped = {};
      data.forEach(item => {
        const {
          fishName, size, price, stock,
          type = 'Uncategorized', category = 'General', subcategory = '', subcategory2 = '', subcategory3 = ''
        } = item;

        const path = [type, category, subcategory, subcategory2, subcategory3].filter(Boolean);
        const key = path.join(' > ');
        if (!grouped[key]) grouped[key] = {};
        if (!grouped[key][fishName]) grouped[key][fishName] = [];
        grouped[key][fishName].push({ size, price, stock });
      });

      stockData = grouped;
      renderFishGrid();
    })
    .catch(err => console.error('Failed to fetch stock:', err));
}

function renderFishGrid(filter = '') {
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
      if (filter && !fish.toLowerCase().includes(filter.toLowerCase())) continue;

      const items = fishEntries[fish];
      if (!Array.isArray(items)) continue;

      const card = document.createElement('div');
      card.className = 'fish-card';

      const mediaWrapper = document.createElement('div');
      mediaWrapper.className = 'fish-media-wrapper';

      const baseName = fish.toLowerCase().replace(/\s+/g, '-');

      const img = document.createElement('img');
      img.src = `images/${baseName}.webp`;
      img.alt = fish;
      img.loading = 'lazy';
      img.onerror = () => {
        img.onerror = null;
        img.src = `images/${baseName}.png`;
        img.onerror = () => {
          img.src = 'images/fallback.png';
        };
      };

      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.display = 'none';
      video.style.maxWidth = '100%';

      mediaWrapper.appendChild(img);
      mediaWrapper.appendChild(video);
      card.appendChild(mediaWrapper);

      mediaWrapper.addEventListener('mouseenter', () => {
        if (!video.src) {
          const tryVideo = (extList) => {
            if (!extList.length) return;
            const ext = extList.shift();
            const testSrc = `images/${baseName}.${ext}`;
            fetch(testSrc, { method: 'HEAD' })
              .then(res => {
                if (res.ok) {
                  video.src = testSrc;
                  video.load();
                  video.play();
                } else {
                  tryVideo(extList);
                }
              })
              .catch(() => tryVideo(extList));
          };
          tryVideo(['mp4', 'mov']);
        } else {
          video.play();
        }
        img.style.display = 'none';
        video.style.display = 'block';
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
      sizeSelect.style.width = '100%';
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
      addBtn.style.marginTop = '8px';
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

  const doaSection = document.createElement('section');
  doaSection.id = 'doa-policy';
  doaSection.innerHTML = `
    <h2>DOA & Shipping Policy</h2>
    <p>We honour any dead-on-arrival (DOA) claims <strong>if</strong> you provide clear video evidence of the parcel being opened on first delivery attempt. Please ensure someone is home to receive the parcel at the time of delivery.</p>
    <p>For the safety of our fish during transport, we do not feed them for 72 hours before shipping. This prevents excess waste in transit and ensures better water quality on arrival.</p>
  `;
  grid.appendChild(doaSection);

  renderCart();
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
  sendPushoverNotification(fullSummary);
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

  const form = document.getElementById('order-form');
  if (form) {
    const consentBox = document.createElement('label');
    consentBox.innerHTML = `
      <input type="checkbox" name="gdpr" required>
      I consent to my data being used for order processing and communication in line with GDPR.
    `;
    form.insertBefore(consentBox, form.querySelector('button[type="submit"]'));
  }

  // Add search input
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search for fish...';
  searchInput.style.width = '100%';
  searchInput.style.margin = '16px 0';
  searchInput.addEventListener('input', (e) => {
    renderFishGrid(e.target.value);
  });
  document.getElementById('fish-grid').before(searchInput);
});
