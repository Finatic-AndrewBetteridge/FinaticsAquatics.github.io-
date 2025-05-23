// fish/RenderFishCard.js - Loops through stockData and renders fish sections

function renderFishGrid(filter = '') {
  const grid = document.getElementById('fish-grid');
  if (!grid) return;
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
}

function createFishCard(fish, items, sectionPath, sectionElement) {
  const card = document.createElement('div');
  card.className = 'fish-card';

  const baseName = fish.toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-');

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

  const hasSale = items.some(i => i.salePrice && i.salePrice < i.price);
  if (hasSale) {
    const badge = document.createElement('span');
    badge.className = 'sale-badge';
    badge.textContent = 'SALE';
    mediaWrapper.appendChild(badge);
  }

  mediaWrapper.addEventListener('mouseenter', () => {
    const exts = ['mp4', 'mov'];
    for (const ext of exts) {
      const src = `images/${baseName}.${ext}`;
      fetch(src, { method: 'HEAD' })
        .then(res => {
          if (res.ok) {
            video.src = src;
            video.play();
            img.style.display = 'none';
            video.style.display = 'block';
          }
        })
        .catch(() => {});
    }
  });

  mediaWrapper.addEventListener('mouseleave', () => {
    video.pause();
    video.currentTime = 0;
    video.style.display = 'none';
    img.style.display = 'block';
  });

  const title = document.createElement('h3');
  title.textContent = fish;

  const displayPrices = items.map(i => i.salePrice && i.salePrice < i.price ? i.salePrice : i.price);
  const min = Math.min(...displayPrices);
  const max = Math.max(...displayPrices);
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
      const priceLabel = entry.salePrice && entry.salePrice < entry.price
        ? `£${entry.salePrice} (was £${entry.price})`
        : `£${entry.price}`;
      opt.textContent = `${entry.size} — ${priceLabel} — Stock: ${entry.stock}`;
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
    saveCart();
    updateCartIcon();
    const notice = document.createElement('div');
    notice.className = 'cart-toast';
    notice.textContent = `${qty} x ${fish} added to cart.`;
    Object.assign(notice.style, {
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: '#0077cc',
      color: 'white',
      padding: '0.5rem 1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      zIndex: 1000,
      fontSize: '0.9rem'
    });
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2000); // ✅ Prevent redirect, show confirmation
  });

  selector.append(sizeSelect, qtyInput, addBtn);

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'fish-card-content';
  contentWrapper.append(title, priceRange, selector);
  card.appendChild(contentWrapper);

  sectionElement.appendChild(card);
}
