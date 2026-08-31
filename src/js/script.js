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

const imageModal = document.getElementById('image-modal');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalClose = document.getElementById('modal-close');

let currentModalImageId = null;

// ---------- Modal & Ações de Imagem ----------

function openModal(imgData) {
  if (!imgData) return;
  currentModalImageId = imgData.id;
  modalTitle.textContent = imgData.name;
  modalImg.src = imgData.url;
  modalImg.alt = imgData.name;
  imageModal.classList.remove('hidden');
  imageModal.classList.add('flex');
}

function closeModal() {
  currentModalImageId = null;
  imageModal.classList.add('hidden');
  imageModal.classList.remove('flex');
}

if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (imageModal) {
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      closeModal();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
    closeModal();
  }
});

function deleteImage(imageId) {
  if (!images[imageId]) return;

  if (images[imageId].url) {
    URL.revokeObjectURL(images[imageId].url);
  }

  delete images[imageId];
  removeImageFromAll(imageId);

  if (currentModalImageId === imageId) {
    closeModal();
  }

  render();
}

// ---------- Renderização ----------

function render() {
  renderTiers();
  renderPool();
  updateStats();
}

function updateStats() {
  const statCount = document.getElementById('stat-count');
  const poolCountBadge = document.getElementById('pool-count-badge');
  const totalCount = Object.keys(images).length;
  const poolCount = unassignedIds.length;

  if (statCount) {
    statCount.textContent = `${totalCount} ${totalCount === 1 ? 'Imagem' : 'Imagens'}`;
  }
  if (poolCountBadge) {
    poolCountBadge.textContent = `${poolCount} ${poolCount === 1 ? 'imagem' : 'imagens'}`;
  }
}

// Dynamic Navbar Scroll Effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  if (window.scrollY > 20) {
    nav.classList.add('shadow-2xl', 'shadow-indigo-950/30', 'py-2', 'bg-gray-900/95');
    nav.classList.remove('py-3', 'bg-gray-900/80');
  } else {
    nav.classList.remove('shadow-2xl', 'shadow-indigo-950/20', 'py-2', 'bg-gray-900/95');
    nav.classList.add('py-3', 'bg-gray-900/80');
  }
});

function renderTiers() {
  tierContainer.innerHTML = '';

  tiers.forEach((tier) => {
    // Row container com animação de entrada
    const row = document.createElement('div');
    row.className = 'flex min-h-[80px] bg-gray-800 animate-row-entry transition-colors duration-200';

    // --- Faixa lateral com EXPANSÃO DINÂMICA baseada no tamanho do texto ---
    const sidebar = document.createElement('div');
    sidebar.className = 'w-auto min-w-[80px] md:min-w-[100px] max-w-[320px] px-3 flex-shrink-0 flex flex-col items-center justify-center gap-1.5 p-2 font-extrabold text-xl md:text-2xl text-gray-900 select-none relative transition-all duration-300 ease-out shadow-inner group/sidebar hover:brightness-105';
    sidebar.style.backgroundColor = tier.color;

    // Label editável que se ajusta em tempo real ao digitar
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.value = tier.label;
    labelInput.className = 'bg-transparent text-center text-gray-900 font-extrabold text-xl md:text-2xl outline-none border-b-2 border-transparent focus:border-gray-900/40 transition-all duration-150 placeholder-gray-700/50 min-w-[1.5ch] max-w-full';
    labelInput.setAttribute('aria-label', 'Nome da tier');

    // Função para expandir/encolher o input e o quadrado da categoria dinamicamente
    const updateInputWidth = () => {
      const charCount = Math.max(labelInput.value.length, 1);
      labelInput.style.width = `${charCount + 0.6}ch`;
    };
    updateInputWidth();

    labelInput.addEventListener('input', (e) => {
      tier.label = e.target.value;
      updateInputWidth();
    });

    // Color picker oculto + botão elegante de paleta
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = tier.color;
    colorInput.className = 'sr-only';
    colorInput.setAttribute('aria-label', 'Cor da tier');
    colorInput.addEventListener('input', (e) => {
      tier.color = e.target.value;
      sidebar.style.backgroundColor = e.target.value;
    });

    const colorBtn = document.createElement('button');
    colorBtn.type = 'button';
    colorBtn.className = 'flex items-center justify-center p-1.5 rounded-full bg-black/15 hover:bg-black/35 text-gray-900 transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 active:scale-95';
    colorBtn.title = 'Alterar tonalidade da tier';
    colorBtn.setAttribute('aria-label', 'Alterar tonalidade da tier ' + tier.label);
    colorBtn.innerHTML = `
      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.71 1.7-1.63 0-.43-.17-.83-.44-1.13-.27-.3-.44-.7-.44-1.14 0-.92.78-1.7 1.7-1.7h2.38C19.83 16.4 22 14.23 22 11.5 22 6.25 17.5 2 12 2z"/>
      </svg>
    `;
    colorBtn.addEventListener('click', () => {
      colorInput.click();
    });

    sidebar.appendChild(labelInput);
    sidebar.appendChild(colorBtn);
    sidebar.appendChild(colorInput);

    // --- Área de drop (imagens) ---
    const dropZone = document.createElement('div');
    dropZone.className = 'flex-1 flex flex-wrap items-start content-start gap-1.5 p-2 min-h-[80px] transition-colors duration-150';
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

    // --- Botão excluir linha ---
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'flex-shrink-0 w-10 flex items-center justify-center bg-gray-800 hover:bg-red-600/90 text-gray-500 hover:text-white transition-all duration-200 border-l border-gray-700/80 group/del';
    deleteBtn.innerHTML = '<svg class="w-5 h-5 transition-transform duration-200 group-hover/del:scale-110 group-hover/del:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
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

/** Cria o elemento de imagem arrastável com animações e efeitos de hover */
function createDraggableImage(imgData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative group w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-gray-700/80 hover:border-indigo-400 cursor-grab active:cursor-grabbing transition-all duration-200 shadow-md hover:shadow-indigo-500/40 hover:scale-110 hover:-rotate-1 z-0 hover:z-20 animate-image-pop select-none';
  wrapper.draggable = true;
  wrapper.dataset.imageId = imgData.id;

  const img = document.createElement('img');
  img.src = imgData.url;
  img.alt = imgData.name;
  img.className = 'w-full h-full object-cover pointer-events-none';

  // Overlay com botões no hover
  const overlay = document.createElement('div');
  overlay.className = 'absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-1 z-10';

  // Top bar: Botões de ação (Ampliar e Excluir)
  const actionContainer = document.createElement('div');
  actionContainer.className = 'flex items-center justify-between gap-1 w-full';

  // Botão Ampliar
  const zoomBtn = document.createElement('button');
  zoomBtn.type = 'button';
  zoomBtn.title = 'Ampliar imagem';
  zoomBtn.setAttribute('aria-label', 'Ampliar imagem ' + imgData.name);
  zoomBtn.className = 'p-1 rounded bg-gray-800/90 hover:bg-indigo-600 text-gray-200 hover:text-white transition-colors shadow focus:outline-none cursor-pointer';
  zoomBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"/></svg>`;

  zoomBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  zoomBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(imgData);
  });

  // Botão Excluir
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.title = 'Excluir imagem';
  deleteBtn.setAttribute('aria-label', 'Excluir imagem ' + imgData.name);
  deleteBtn.className = 'p-1 rounded bg-gray-800/90 hover:bg-red-600 text-gray-200 hover:text-white transition-colors shadow focus:outline-none cursor-pointer';
  deleteBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;

  deleteBtn.addEventListener('mousedown', (e) => e.stopPropagation());
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteImage(imgData.id);
  });

  actionContainer.appendChild(zoomBtn);
  actionContainer.appendChild(deleteBtn);

  // Nome da imagem no rodapé
  const nameSpan = document.createElement('span');
  nameSpan.className = 'text-[10px] text-white truncate w-full text-center font-medium pointer-events-none leading-tight drop-shadow';
  nameSpan.textContent = imgData.name;

  overlay.appendChild(actionContainer);
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
