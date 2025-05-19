// fish/RenderFishCard.js - Loops through stockData and renders fish sections

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
      createFishCard(fish, items, path, sectionMap[sectionId]);
    });
  });

  renderCart();
}


// fish/renderCard.js - Builds and returns a DOM element for a fish card

function createFishCard(fish, items, sectionPath, sectionElement) {
  const card = document.createElement('div');
  card.className = 'fish-card';

  const baseName = fish.toLowerCase().replace(/\s+/g, '-');

  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'fish-media-wrapper';

  const img = document.createElement('img');
  img.src = `images/${baseName}.jpg`;
  img.alt = fish;
  img.loading = 'lazy';
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

  [img, video].forEach(el => {
    Object.assign(el.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      backgroundColor: '#000'
    });
  });

  mediaWrapper.append(img, video);
  card.append(mediaWrapper);

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

  const prices = items.map(i => i.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const priceRange = document.createElement('p');
  priceRange.textContent = min === max ? `Price: £${min}` : `Price Range: £${min} - £${max}`;
  priceRange.style.fontWeight = 'bold';
  priceRange.style.margin = '0.5em 0';

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

    // Update cart UI with delivery charge
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

    const delivery = 14.99;
    total += delivery;
    cartTotal.textContent = `Items Total: £${(total - delivery).toFixed(2)}\nDelivery: £${delivery.toFixed(2)}\nTotal: £${total.toFixed(2)}`;

    localStorage.setItem('cart', JSON.stringify(cart));

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.onclick = () => {
        cart.splice(btn.dataset.index, 1);
        renderCart();
      };
    });

    updateCartIcon();
    renderPayPalButton(total);
  });

  selector.append(sizeSelect, qtyInput, addBtn);
  card.append(title, priceRange, selector);
  sectionElement.appendChild(card);
}
