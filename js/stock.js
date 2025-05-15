// stock.js - Handles fetching and grouping fish stock

let stockData = {};

function groupFishStock(data) {
  const grouped = {};
  data.forEach(({ fishName, size, price, stock, type = 'Uncategorized', category = 'General', subcategory = '', subcategory2 = '', subcategory3 = '' }) => {
    const path = [type, category, subcategory, subcategory2, subcategory3].filter(Boolean).join(' > ');
    grouped[path] = grouped[path] || {};
    grouped[path][fishName] = grouped[path][fishName] || [];
    grouped[path][fishName].push({ size, price, stock });
  });
  return grouped;
}

function fetchStock() {
  return fetch(sheetUrl)
    .then(res => res.json())
    .then(data => {
      stockData = groupFishStock(data);
      renderFishGrid();
    })
    .catch(err => console.error('Failed to fetch stock:', err));
}
