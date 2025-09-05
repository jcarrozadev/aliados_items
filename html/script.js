const wrapper = document.getElementById('wrapper');
const listEl  = document.getElementById('list');
const search  = document.getElementById('search');
const closeBtn = document.getElementById('close');

const sortSelect  = document.getElementById('sort');      // select de orden
const minWeightEl = document.getElementById('minWeight'); // input número
const maxWeightEl = document.getElementById('maxWeight'); // input número

const typeFilterEl = document.getElementById('typeFilter');

let ALL_ITEMS = [];

const IMG_BASE = 'nui://qb-inventory/html/images/';
const PLACEHOLDER = 'placeholder.png';

const MISSING = new Set();
const _pre = new Image();
_pre.src = IMG_BASE + PLACEHOLDER;

function show(){ wrapper.style.display = 'flex'; }
function hide(){ wrapper.style.display = 'none'; }

function mkImgSrc(it) {
  const name  = (it.name || '').toString();
  const image = (it.image && it.image.length ? it.image : `${name}.png`);
  return image;
}

function getType(it){
  let t = String(it.type || it.Type || '').toLowerCase();
  if (!t) {
    const n = String(it.name || '').toLowerCase();
    if (n.startsWith('weapon_')) t = 'weapon';
    else t = 'item';
  }
  return t;
}

function getFilteredSortedItems() {
  const q = (search.value || '').trim().toLowerCase();
  const minW = parseInt(minWeightEl?.value || '', 10);
  const maxW = parseInt(maxWeightEl?.value || '', 10);
  const hasMin = !Number.isNaN(minW);
  const hasMax = !Number.isNaN(maxW);
  const typeFilter = (typeFilterEl?.value || 'all').toLowerCase(); // all|item|weapon

  let items = ALL_ITEMS.filter(it => {
    const name  = (it.name  || '').toLowerCase();
    const label = (it.label || '').toLowerCase();
    const okText = !q || name.includes(q) || label.includes(q);

    const t = getType(it);
    const okType = typeFilter === 'all' || t === typeFilter;

    const w = Number(it.weight ?? it.Weight ?? 0);
    const okMin = !hasMin || w >= minW;
    const okMax = !hasMax || w <= maxW;

    return okText && okType && okMin && okMax;
  });

  const mode = sortSelect?.value || 'label_asc';
  const toVal = (x) => ({
    name: String(x.name||''),
    label: String(x.label||x.name||''),
    weight: Number(x.weight ?? x.Weight ?? 0),
    type: getType(x)
  });
  const rank = (t) => (t === 'weapon' ? 1 : 0); // item=0, weapon=1

  items.sort((a, b) => {
    const A = toVal(a), B = toVal(b);
    switch (mode) {
      case 'name_asc':     return A.name.localeCompare(B.name, 'es', {sensitivity:'base'});
      case 'name_desc':    return B.name.localeCompare(A.name, 'es', {sensitivity:'base'});
      case 'label_asc':    return A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
      case 'label_desc':   return B.label.localeCompare(A.label, 'es', {sensitivity:'base'});
      case 'weight_asc':   return A.weight - B.weight;
      case 'weight_desc':  return B.weight - A.weight;
      case 'type_asc':     return A.type.localeCompare(B.type, 'es', {sensitivity:'base'}) || A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
      case 'type_desc':    return B.type.localeCompare(A.type, 'es', {sensitivity:'base'}) || A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
      case 'weapon_first': return rank(B.type) - rank(A.type) || A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
      case 'item_first':   return rank(A.type) - rank(B.type) || A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
      default:             return A.label.localeCompare(B.label, 'es', {sensitivity:'base'});
    }
  });

  return items;
}


const toastEl = document.getElementById('toast');

function showToast(msg, ms = 1400) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.classList.remove('show');
  }, ms);
}

async function copyToClipboard(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);

    // Selecciona y copia
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');

    document.body.removeChild(ta);

    if (ok) {
      showToast(`Copiado: ${text}`);
    } else {
      showToast('No se pudo copiar');
    }
  } catch (e) {
    showToast('No se pudo copiar');
  }
}

function render(items) {
  listEl.innerHTML = '';

  items.forEach(it => {
    const name  = (it.name || '').toString();
    const label = (it.label || name).toString();
    const image = mkImgSrc(it);

    const card = document.createElement('div');
    card.className = 'card';
    // 👇 click para copiar el item_name
    card.addEventListener('click', () => copyToClipboard(name));

    const imgwrap = document.createElement('div');
    imgwrap.className = 'imgwrap';

    const img = document.createElement('img');
    img.alt = label;
    img.loading = 'lazy';
    img.decoding = 'async';

    if (MISSING.has(image)) {
      img.src = IMG_BASE + PLACEHOLDER;
    } else {
      img.src = IMG_BASE + image;
      img.onerror = () => {
        MISSING.add(image);
        img.onerror = null;
        img.src = IMG_BASE + PLACEHOLDER;
      };
    }

    imgwrap.appendChild(img);

    const labelEl = document.createElement('div');
    labelEl.className = 'label';
    labelEl.textContent = label;

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = name;

    const typeStr = getType(it);
    const typeEl = document.createElement('div');
    typeEl.className = 'name';
    typeEl.textContent = `Tipo: ${typeStr}`;
    card.appendChild(typeEl);

    const w = Number(it.weight ?? it.Weight);
    if (!Number.isNaN(w)) {
      const wEl = document.createElement('div');
      wEl.className = 'name';
      wEl.textContent = `Peso: ${w}`;
      card.appendChild(wEl);
    }

    card.appendChild(imgwrap);
    card.appendChild(labelEl);
    card.appendChild(nameEl);
    listEl.appendChild(card);
  });
}


function applyUI() {
  render(getFilteredSortedItems());
}

function doFilter() { applyUI(); }

search.addEventListener('input', doFilter);

if (sortSelect)  sortSelect.addEventListener('change', applyUI);
if (minWeightEl) minWeightEl.addEventListener('input', applyUI);
if (maxWeightEl) maxWeightEl.addEventListener('input', applyUI);
if (typeFilterEl) typeFilterEl.addEventListener('change', applyUI);

closeBtn.addEventListener('click', () => {
  fetch(`https://${GetParentResourceName()}/close`, {
    method: 'POST',
    body: JSON.stringify({})
  });
  hide();
});

window.addEventListener('message', (e) => {
  const data = e.data || {};
  if (data.action === 'open') {
    search.value = '';
    show();
    render([]); 
  }
  if (data.action === 'hide') {
    hide();
  }
  if (data.action === 'setItems') {
    ALL_ITEMS = Array.isArray(data.items) ? data.items : [];
    applyUI();
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    closeBtn.click();
  }
});

hide();
