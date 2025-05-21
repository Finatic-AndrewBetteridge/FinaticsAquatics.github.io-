document.addEventListener('DOMContentLoaded', () => {
  const navList = document.querySelector('.hero-nav ul');
  if (!navList || !window.stockData) return;

  for (const [categoryPath, fishMap] of Object.entries(stockData)) {
    const li = document.createElement('li');
    li.classList.add('dropdown');

    const label = document.createElement('span');
    label.textContent = categoryPath;
    li.appendChild(label);

    const dropdown = document.createElement('ul');
    dropdown.classList.add('dropdown-content');

    for (const fishName of Object.keys(fishMap)) {
      const slug = fishName.toLowerCase().replace(/\s+/g, '-');
      const a = document.createElement('a');
      a.href = `fish.html?name=${slug}`;
      a.textContent = fishName;

      const item = document.createElement('li');
      item.appendChild(a);
      dropdown.appendChild(item);
    }

    li.appendChild(dropdown);
    navList.appendChild(li);
  }
});
