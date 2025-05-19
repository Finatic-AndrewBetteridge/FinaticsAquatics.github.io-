// stock.js - Handles fetching and grouping fish stock

let stockData = {};

function groupFishStock(data) {
  const grouped = {};
  data.forEach(({ fishName, size, price, stock, type = 'Uncategorized', category = 'General', subcategory = '', subcategory2 = '', subcategory3 = '' }) => {
    const path = [type, category, subcategory, subcategory2, subcategory3]
      .filter(Boolean)
      .join(' > ');

    if (!grouped[path]) grouped[path] = {};
    if (!grouped[path][fishName]) grouped[path][fishName] = [];

    grouped[path][fishName].push({ size, price, stock });
  });
  return grouped;
}

function fetchStock() {
  return fetch(stockUrl)  // must return the fetch promise!
    .then(res => {
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      return res.json();
    })
    .then(data => {
      stockData = groupFishStock(data);
      renderFishGrid();
    });
}

