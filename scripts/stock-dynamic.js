const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';

async function fetchStock() {
  try {
    const res = await fetch(sheetUrl);
    const data = await res.json();

    const grid = document.getElementById('fish-grid');
    const formSelect = document.getElementById('fish');
    const addedToForm = new Set();

    for (const fish in data) {
      const items = data[fish];

      // Create the fish card
      const card = document.createElement('div');
      card.className = 'fish-card';

      const name = document.createElement('h3');
      name.textContent = fish;
      card.appendChild(name);

      const list = document.createElement('ul');
      list.className = 'stock-table';

      items.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `${entry.size} — £${entry.price} — <strong>In Stock: ${entry.stock}</strong>`;
        list.appendChild(li);
      });

      card.appendChild(list);
      grid.appendChild(card);

      // Add to reservation form dropdown
      if (!addedToForm.has(fish)) {
        const option = document.createElement('option');
        option.value = fish;
        option.textContent = fish;
        formSelect.appendChild(option);
        addedToForm.add(fish);
      }
    }

  } catch (error) {
    console.error('Failed to load stock data:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchStock);
