// ============================================================
// Tier List Maker — JavaScript Puro
// Estado em memória, DnD nativo (HTML5), export PNG via html2canvas
// ============================================================

// ---------- Estado global ----------

/** @type {{ id: string, label: string, color: string, imageIds: string[] }[]} */
let tiers = [
  { id: 'S', label: 'S', color: '#FF7F7F', imageIds: [] },
  { id: 'A', label: 'A', color: '#FFBF7F', imageIds: [] },
  { id: 'B', label: 'B', color: '#FFDF7F', imageIds: [] },
  { id: 'C', label: 'C', color: '#FFFF7F', imageIds: [] },
  { id: 'D', label: 'D', color: '#BFFF7F', imageIds: [] },
];

/** @type {{ [id: string]: { id: string, url: string, name: string } }} */
let images = {};

/** @type {string[]} */
let unassignedIds = [];

/** ID da imagem sendo arrastada */
let draggedImageId = null;

// ---------- Seletores DOM ----------

const tierContainer = document.getElementById('tier-container');
const poolImagesEl = document.getElementById('pool-images');
const poolEmptyEl = document.getElementById('pool-empty');
const imageUploadEl = document.getElementById('image-upload');
const btnAddRow = document.getElementById('btn-add-row');
const btnDownload = document.getElementById('btn-download');

// ---------- Renderização ----------

function render() {
  renderTiers();
  renderPool();
}

function renderTiers() {
  tierContainer.innerHTML = '';

  tiers.forEach((tier) => {
    // Row container
    const row = document.createElement('div');
    row.className = 'flex min-h-[80px] bg-gray-800';

    // --- Faixa lateral (label + cor) ---
    const sidebar = document.createElement('div');
    sidebar.className = 'w-20 md:w-24 flex-shrink-0 flex flex-col items-center justify-center gap-1 p-2 font-extrabold text-xl md:text-2xl text-gray-900 select-none';
    sidebar.style.backgroundColor = tier.color;

    // Label editável
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = tier.label;
    labelInput.className = 'w-full bg-transparent text-center text-gray-900 font-extrabold text-xl md:text-2xl outline-none border-b-2 border-transparent focus:border-gray-900/40 transition-colors placeholder-gray-600';
    labelInput.setAttribute('aria-label', 'Nome da tier');
    labelInput.addEventListener('input', (e) => {
      tier.label = e.target.value;
    });

    // Color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = tier.color;
    colorInput.className = 'w-7 h-7 cursor-pointer rounded border-2 border-gray-900/20 hover:border-gray-900/50 transition-colors';
    colorInput.setAttribute('aria-label', 'Cor da tier');
    colorInput.addEventListener('input', (e) => {
      tier.color = e.target.value;
      sidebar.style.backgroundColor = e.target.value;
    });

    sidebar.appendChild(labelInput);
    sidebar.appendChild(colorInput);

    // --- Área de drop (imagens) ---
    const dropZone = document.createElement('div');
    dropZone.className = 'flex-1 flex flex-wrap items-start content-start gap-1 p-2 min-h-[80px] transition-colors duration-150';
    dropZone.dataset.tierId = tier.id;

    // Drag events na drop zone
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', (e) => handleDrop(e, tier.id));

    // Renderizar imagens da tier
    tier.imageIds.forEach((imgId) => {
      const img = images[imgId];
      if (img) {
        dropZone.appendChild(createDraggableImage(img));
      }
    });

    // --- Botão excluir ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'flex-shrink-0 w-10 flex items-center justify-center bg-gray-800 hover:bg-red-600/80 text-gray-500 hover:text-white transition-colors duration-200 border-l border-gray-700';
    deleteBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
    deleteBtn.setAttribute('aria-label', 'Excluir tier ' + tier.label);
    deleteBtn.addEventListener('click', () => deleteTier(tier.id));

    row.appendChild(sidebar);
    row.appendChild(dropZone);
    row.appendChild(deleteBtn);
    tierContainer.appendChild(row);
  });
}

function renderPool() {
  poolImagesEl.innerHTML = '';

  if (unassignedIds.length === 0) {
    poolEmptyEl.classList.remove('hidden');
  } else {
    poolEmptyEl.classList.add('hidden');
  }

  unassignedIds.forEach((imgId) => {
    const img = images[imgId];
    if (img) {
      poolImagesEl.appendChild(createDraggableImage(img));
    }
  });
}

/** Cria o elemento de imagem arrastável */
function createDraggableImage(imgData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative group w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing transition-all duration-150 shadow-md hover:shadow-indigo-500/20 hover:scale-105';
  wrapper.draggable = true;
  wrapper.dataset.imageId = imgData.id;

  const img = document.createElement('img');
  img.src = imgData.url;
  img.alt = imgData.name;
  img.className = 'w-full h-full object-cover pointer-events-none';

  // Overlay com nome no hover
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-end p-1';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-[10px] text-white truncate w-full text-center font-medium';
  nameSpan.textContent = imgData.name;
  overlay.appendChild(nameSpan);

  wrapper.appendChild(img);
  wrapper.appendChild(overlay);

  // Drag events
  wrapper.addEventListener('dragstart', (e) => {
    draggedImageId = imgData.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', imgData.id);
    wrapper.classList.add('opacity-40', 'scale-95');
  });

  wrapper.addEventListener('dragend', () => {
    wrapper.classList.remove('opacity-40', 'scale-95');
    draggedImageId = null;
    // Limpa estilos de highlight de todas as zonas
    document.querySelectorAll('[data-tier-id], #pool-images').forEach((el) => {
      el.classList.remove('bg-indigo-900/30', 'border-indigo-500');
    });
  });

  return wrapper;
}

// ---------- Drag & Drop handlers ----------

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('bg-indigo-900/30');
}

function handleDragLeave(e) {
  // Só remove se realmente saiu do container (não de um filho)
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('bg-indigo-900/30');
  }
}

function handleDrop(e, targetId) {
  e.preventDefault();
  e.currentTarget.classList.remove('bg-indigo-900/30');

  const imageId = e.dataTransfer.getData('text/plain') || draggedImageId;
  if (!imageId || !images[imageId]) return;

  // Remover da origem (qualquer tier ou pool)
  removeImageFromAll(imageId);

  // Adicionar ao destino
  if (targetId === 'pool') {
    unassignedIds.push(imageId);
  } else {
    const tier = tiers.find((t) => t.id === targetId);
    if (tier) {
      tier.imageIds.push(imageId);
    }
  }

  render();
}

function removeImageFromAll(imageId) {
  // Remover do pool
  unassignedIds = unassignedIds.filter((id) => id !== imageId);

  // Remover de todas as tiers
  tiers.forEach((tier) => {
    tier.imageIds = tier.imageIds.filter((id) => id !== imageId);
  });
}

// ---------- Pool drag events ----------

const poolContainer = document.getElementById('image-pool');
poolContainer.addEventListener('dragover', handleDragOver);
poolContainer.addEventListener('dragenter', (e) => {
  e.preventDefault();
  poolContainer.classList.add('border-indigo-500', 'bg-indigo-900/20');
});
poolContainer.addEventListener('dragleave', (e) => {
  if (!poolContainer.contains(e.relatedTarget)) {
    poolContainer.classList.remove('border-indigo-500', 'bg-indigo-900/20');
  }
});
poolContainer.addEventListener('drop', (e) => {
  poolContainer.classList.remove('border-indigo-500', 'bg-indigo-900/20');
  handleDrop(e, 'pool');
});

// ---------- Upload de imagens ----------

imageUploadEl.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    const name = file.name.replace(/\.[^/.]+$/, ''); // nome sem extensão

    images[id] = { id, url, name };
    unassignedIds.push(id);
  });

  // Limpar input para permitir re-upload do mesmo arquivo
  e.target.value = '';
  render();
});

// Cleanup de URLs ao fechar a página
window.addEventListener('beforeunload', () => {
  Object.values(images).forEach((img) => {
    URL.revokeObjectURL(img.url);
  });
});

// ---------- Adicionar linha ----------

btnAddRow.addEventListener('click', () => {
  const id = 'tier-' + crypto.randomUUID().slice(0, 8);
  tiers.push({
    id,
    label: 'Nova',
    color: '#D3D3D3',
    imageIds: [],
  });
  render();
});

// ---------- Excluir linha ----------

function deleteTier(tierId) {
  const tier = tiers.find((t) => t.id === tierId);
  if (!tier) return;

  // Mover imagens de volta ao pool antes de remover
  unassignedIds.push(...tier.imageIds);

  tiers = tiers.filter((t) => t.id !== tierId);
  render();
}

// ---------- Export PNG ----------

btnDownload.addEventListener('click', async () => {
  if (typeof html2canvas === 'undefined') {
    alert('Erro: html2canvas não carregou. Verifique sua conexão com a internet.');
    return;
  }

  try {
    btnDownload.disabled = true;
    btnDownload.classList.add('opacity-50', 'cursor-wait');

    const canvas = await html2canvas(tierContainer, {
      backgroundColor: '#030712',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = 'tierlist.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    console.error('Erro ao exportar PNG:', err);
    alert('Erro ao gerar PNG. Algumas imagens podem ter restrições de CORS.');
  } finally {
    btnDownload.disabled = false;
    btnDownload.classList.remove('opacity-50', 'cursor-wait');
  }
});

// ---------- Render inicial ----------

render();
