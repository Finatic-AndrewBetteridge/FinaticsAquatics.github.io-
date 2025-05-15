// main.js - Finatics Aquatics with PayPal Integration

const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';
const pushoverToken = 'aw5814unpeck3oz59f4q9ucs8y3as';
const pushoverUser = 'u919vjqcq2q4n8g9jto2pns6ctjiew';
let stockData = {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// --- Notifications ---
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
  }).catch(err => console.error('Pushover error:', err));
}

function sendEmailConfirmation(email, summary) {
  fetch('https://formspree.io/f/mwpobwwy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, message: summary })
  }).catch(console.error);
}

// --- Data Fetch ---
function fetchStock() {
  fetch(sheetUrl)
    .then(res => res.json())
    .then(data => {
      const grouped = {};
      data.forEach(({ fishName, size, price, stock, type = 'Uncategorized', category = 'General', subcategory = '', subcategory2 = '', subcategory3 = '' }) => {
        const path = [type, category, subcategory, subcategory2, subcategory3].filter(Boolean).join(' > ');
        grouped[path] = grouped[path] || {};
        grouped[path][fishName] = grouped[path][fishName] || [];
        grouped[path][fishName].push({ size, price, stock });
      });
      stockData = grouped;
      renderFishGrid();
    })
    .catch(err => console.error('Failed to fetch stock:', err));
}

// --- Fish Display ---
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
      const fishList = document.createElement('div');
      fishList.className = 'fish-grid';
      section.appendChild(heading);
      section.appendChild(fishList);
      grid.appendChild(section);
      sectionMap[sectionId] = fishList;
    }

    Object.entries(stockData[path]).forEach(([fish, items]) => {
      if (filter && !fish.toLowerCase().includes(filter.toLowerCase())) return;
      const card = document.createElement('div');
      card.className = 'fish-card';

      const mediaWrapper = document.createElement('div');
      mediaWrapper.className = 'fish-media-wrapper';
      mediaWrapper.style.position = 'relative';
      mediaWrapper.style.aspectRatio = '4 / 3';
      mediaWrapper.style.overflow = 'hidden';
      mediaWrapper.style.marginBottom = '0.5em';

      const baseName = fish.toLowerCase().replace(/\s+/g, '-');

      const img = document.createElement('img');
      img.src = `images/${baseName}.jpg`;
      img.alt = fish;
      img.loading = 'lazy';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.onerror = () => {
        img.onerror = null;
        img.src = `images/${baseName}.jpeg`;
        img.onerror = () => {
          img.src = 'images/fallback.png';
        };
      };

      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.style.display = 'none';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      video.style.position = 'absolute';
      video.style.top = '0';
      video.style.left = '0';

      mediaWrapper.appendChild(img);
      mediaWrapper.appendChild(video);
      card.appendChild(mediaWrapper);

      mediaWrapper.addEventListener('mouseenter', () => {
        if (!video.src) {
          const tryVideo = (exts) => {
            if (!exts.length) return;
            const ext = exts.shift();
            const src = `images/${baseName}.${ext}`;
            fetch(src, { method: 'HEAD' }).then(r => {
              if (r.ok) {
                video.src = src;
                video.play();
              } else tryVideo(exts);
            }).catch(() => tryVideo(exts));
          };
          tryVideo(['mp4', 'mov']);
        } else {
          video.play();
        }
        img.style.display = 'none';
        video.style.display = 'block';
      });

      mediaWrapper.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
        video.style.display = 'none';
        img.style.display = 'block';
      });

      const title = document.createElement('h3');
      title.textContent = fish;

      const selector = document.createElement('div');
      selector.className = 'selector';

      const sizeSelect = document.createElement('select');
      sizeSelect.innerHTML = '<option value="">Choose a size</option>';
      items.forEach(entry => {
        if (entry.stock > 0) {
          const opt = document.createElement('option');
          opt.value = JSON.stringify(entry);
          opt.textContent = `${entry.size} — £${entry.price} — Stock: ${entry.stock}`;
          sizeSelect.appendChild(opt);
        }
      });

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = '1';

      const addBtn = document.createElement('button');
      addBtn.textContent = 'Add to Cart';
      addBtn.addEventListener('click', () => {
        const selected = sizeSelect.value;
        const qty = parseInt(qtyInput.value);
        if (!selected || isNaN(qty) || qty < 1) return alert('Choose size & quantity');
        const { size, price } = JSON.parse(selected);
        cart.push({ fish, size, quantity: qty, price });
        renderCart();
      });

      selector.append(sizeSelect, qtyInput, addBtn);
      card.append(title, selector);
      sectionMap[sectionId].appendChild(card);
    });
  });

  const doaSection = document.createElement('section');
  doaSection.id = 'doa-policy';
  doaSection.innerHTML = `
    <h2>DOA & Shipping Policy</h2>
    <p>Claims must include clear video of parcel being opened on first delivery attempt.</p>
    <p>We fast fish for 72 hours before shipment for water quality.</p>
  `;
  grid.appendChild(doaSection);
  renderCart();
}

// --- Cart Management ---
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach((item, i) => {
    const subtotal = item.quantity * item.price;
    const li = document.createElement('li');
    li.innerHTML = `${item.quantity} x ${item.fish} (${item.size}) — £${subtotal}
      <button data-index="${i}" class="remove-btn">Remove</button>`;
    cartItems.appendChild(li);
    total += subtotal;
  });

  cartTotal.textContent = total > 0 ? `Total: £${total}` : '';
  localStorage.setItem('cart', JSON.stringify(cart));

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.onclick = () => {
      cart.splice(btn.dataset.index, 1);
      renderCart();
    };
  });

  renderPayPalButton(total);
}

// --- PayPal ---
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
      actions.order.capture().then(details => {
        alert('Payment complete. Thank you!');
        sendPushoverNotification(`${name} (${email}) paid £${totalAmount}\n\n${orderSummary}`);
        sendEmailConfirmation(email, orderSummary);
        cart = [];
        localStorage.removeItem('cart');
        renderCart();
      }),
    onError: err => alert('Payment failed. Please try again.')
  }).render('#paypal-button-container');
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  fetchStock();
  const clearBtn = document.getElementById('clear-cart');
  if (clearBtn) clearBtn.onclick = () => {
    cart = [];
    localStorage.removeItem('cart');
    renderCart();
  };

  const search = document.createElement('input');
  search.placeholder = 'Search fish...';
  search.addEventListener('input', e => renderFishGrid(e.target.value));
  const grid = document.getElementById('fish-grid');
  if (grid) grid.before(search);
});
