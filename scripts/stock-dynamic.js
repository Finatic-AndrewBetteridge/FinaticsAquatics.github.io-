const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';

let stockData = {};

async function fetchStock() {
  try {
    const res = await fetch(sheetUrl);
    stockData = await res.json();

    const grid = document.getElementById('fish-grid');
    const fishSelect = document.getElementById('fish');
    const sizeSelect = document.getElementById('size');

    // Clear existing content
    grid.innerHTML = '';
    fishSelect.innerHTML = '<option value="">Select a species</option>';
    sizeSelect.innerHTML = '<option value="">Please select a species first</option>';

    for (const fish in stockData) {
      const items = stockData[fish];

      // Create card
      const card = document.createElement('div');
      card.className = 'fish-card';

      // Add image
      const img = document.createElement('img');
      const baseName = fish.toLowerCase().replace(/\s+/g, '-');
      img.src = `images/${baseName}.jpg`;
      img.alt = fish;

      img.onerror = () => {
        img.onerror = null;
        img.src = `images/${baseName}.png`;
        img.onerror = () => {
          img.src = 'images/fallback.jpg'; // Use fallback image
        };
      };

      card.appendChild(img);

      // Title
      const name = document.createElement('h3');
      name.textContent = fish;
      card.appendChild(name);

      // Size list
      const list = document.createElement('ul');
      list.className = 'stock-table';

      items.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `${entry.size} — £${entry.price} — <strong>In Stock: ${entry.stock}</strong>`;
        list.appendChild(li);
      });

      card.appendChild(list);
      grid.appendChild(card);

      // Add to fish dropdown
      const option = document.createElement('option');
      option.value = fish;
      option.textContent = fish;
      fishSelect.appendChild(option);
    }

    // Size dropdown update
    fishSelect.addEventListener('change', () => {
      const selectedFish = fishSelect.value;
      sizeSelect.innerHTML = '';

      if (stockData[selectedFish]) {
        stockData[selectedFish].forEach(entry => {
          const option = document.createElement('option');
          option.value = entry.size;
          option.textContent = `${entry.size} — £${entry.price} — In Stock: ${entry.stock}`;
          sizeSelect.appendChild(option);
        });
      } else {
        sizeSelect.innerHTML = '<option value="">Please select a species first</option>';
      }
    });

  } catch (error) {
    console.error('Failed to load stock data:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchStock);
