document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('fish-detail');
  const slug = new URLSearchParams(window.location.search).get('name');

  if (!slug) {
    container.innerHTML = '<p>❌ Invalid fish name in URL.</p>';
    return;
  }

  const waitForStockData = () => {
    if (!window.stockData || Object.keys(stockData).length === 0) {
      setTimeout(waitForStockData, 100);
      return;
    }

    let fishData = null;
    for (const [path, fishes] of Object.entries(stockData)) {
      for (const [name, variants] of Object.entries(fishes)) {
        const fishSlug = name.toLowerCase().replace(/\s+/g, '-');
        if (fishSlug === slug) {
          fishData = { name, path, variants };
          break;
        }
      }
      if (fishData) break;
    }

    if (!fishData) {
      container.innerHTML = '<p>❌ Fish not found.</p>';
      return;
    }

    const { name, path, variants } = fishData;
    const imgSrc = `images/${slug}.jpg`;
    const prices = variants.map(v => v.salePrice && v.salePrice < v.price ? v.salePrice : v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    container.innerHTML = `
      <h1>${name}</h1>
      <img src="${imgSrc}" alt="${name}" style="max-width:100%;margin-bottom:1rem;" onerror="this.src='images/fallback.png'">
      <p><strong>Category:</strong> ${path}</p>
      <p><strong>Price:</strong> ${min === max ? `£${min}` : `£${min} – £${max}`}</p>

      <h2>Sizes Available</h2>
      <ul style="line-height:1.6;">
        ${variants.map(v => `
          <li>
            ${v.size} – 
            ${v.salePrice && v.salePrice < v.price 
              ? `<del>£${v.price}</del> <strong>£${v.salePrice}</strong>` 
              : `£${v.price}`
            } 
            (${v.stock} in stock)
          </li>`).join('')}
      </ul>

      <p style="font-style:italic;margin-top:2rem;">More care info, compatibility and tank setup details coming soon.</p>
    `;
  };

  waitForStockData();
});
