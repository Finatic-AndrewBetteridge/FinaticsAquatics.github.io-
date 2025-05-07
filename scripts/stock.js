const stockData = {
    "Blue Livingstonii": [
      { size: "1–1.5 inch", price: 3, stock: 12 },
      { size: "2 inch", price: 4, stock: 7 },
      { size: "3+ inch", price: 5, stock: 4 }
    ],
    "Yellow Labs": [
      { size: "1–1.5 inch", price: 3, stock: 10 },
      { size: "2+ inch", price: 4, stock: 5 }
    ],
    "OB Cichlids": [
      { size: "Coming Soon", price: "-", stock: 0 }
    ]
  };
  
  function populateStockTables() {
    for (let species in stockData) {
      const stockList = stockData[species];
      const id = `stock-${species.toLowerCase().replace(/ /g, '-')}`;
      const ul = document.getElementById(id);
      if (!ul) continue;
      stockList.forEach((entry, index) => {
        const li = document.createElement("li");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = species;
        radio.value = `${entry.size} - £${entry.price}`;
        radio.id = `${id}-${index}`;
        if (entry.stock === 0) radio.disabled = true;
  
        const label = document.createElement("label");
        label.htmlFor = radio.id;
        label.textContent = `${entry.size} — £${entry.price} — In Stock: ${entry.stock}`;
  
        li.appendChild(radio);
        li.appendChild(label);
        ul.appendChild(li);
      });
    }
  }
  
  function reserveFish(species) {
    const selected = document.querySelector(`input[name="${species}"]:checked`);
    if (!selected) {
      alert(`Please select a size for ${species}.`);
      return;
    }
    const message = encodeURIComponent(`Hi, I'd like to reserve a ${species} (${selected.value}) from Finatics Aquatics.`);
    window.open(`https://wa.me/44XXXXXXXXXX?text=${message}`, '_blank');
  }
  
  document.addEventListener("DOMContentLoaded", populateStockTables);

  const sheetUrl = 'https://script.google.com/macros/s/AKfycby7R9zrOBS-pg0AwxU_yRaKLo6VUWM8oPjLFkZhiJyl2SkTVw98ENSsO3iC3ISHYqSd/exec';

async function fetchStock() {
  try {
    const res = await fetch(sheetUrl);
    const data = await res.json();

    for (const fish in data) {
      const containerId = `stock-${fish.toLowerCase().replace(/\\s+/g, '-')}`;
      const container = document.getElementById(containerId);
      if (!container) continue;

      container.innerHTML = '';
      data[fish].forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `${entry.size} — £${entry.price} — <strong>In Stock: ${entry.stock}</strong>`;
        container.appendChild(li);
      });
    }
  } catch (error) {
    console.error('Failed to fetch stock data:', error);
  }
}

function reserveFish(fish) {
  alert(`Please contact us via WhatsApp to reserve your ${fish}.`);
}

document.addEventListener('DOMContentLoaded', fetchStock);
