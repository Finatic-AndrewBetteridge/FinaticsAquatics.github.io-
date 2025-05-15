// fish/renderGrid.js - Loops through stockData and renders fish sections

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
