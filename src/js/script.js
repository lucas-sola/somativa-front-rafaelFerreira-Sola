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

/** Sessão e publicações simuladas: permanecem apenas enquanto a página estiver aberta. */
let currentUser = null;
let publications = [];
let currentListTitle = 'Minha Tier List';

const defaultTiers = () => [
  { id: 'S', label: 'S', color: '#FF7F7F', imageIds: [] },
  { id: 'A', label: 'A', color: '#FFBF7F', imageIds: [] },
  { id: 'B', label: 'B', color: '#FFDF7F', imageIds: [] },
  { id: 'C', label: 'C', color: '#FFFF7F', imageIds: [] },
  { id: 'D', label: 'D', color: '#BFFF7F', imageIds: [] },
];

const templates = [
  { id: 'games', title: 'Jogos inesquecíveis', description: '16 jogos com as capas enviadas por você.', icon: '🎮', accent: 'from-violet-600 to-indigo-600', items: [['Hades', '🔥', 'hades.png'], ['Elden Ring', '⚔️', 'elden-ring.png'], ['Red Dead Redemption 2', '🤠', 'red-dead-redemption-2.png'], ['GTA V', '🚗', 'gta-v.png'], ['God of War', '🪓', 'god-of-war.png'], ['The Last of Us Part I', '🎸', 'the-last-of-us-part-1.png'], ['Cyberpunk 2077', '🤖', 'cyberpunk-2077.png'], ['Baldur’s Gate 3', '🐉', 'baldurs-gate-3.png'], ['Stardew Valley', '🌾', 'stardew-valley.png'], ['Hollow Knight', '🐞', 'hollow-knight.png'], ['Celeste', '🏔️', 'celeste.png'], ['Cuphead', '☕', 'cuphead.png'], ['Among Us', '👨‍🚀', 'among-us.png'], ['Terraria', '🌲', 'terraria.png'], ['Dead by Daylight', '🪝', 'dead-by-daylight.png'], ['It Takes Two', '🧶', 'it-takes-two.png']] },
  { id: 'movies', title: 'Filmes para maratonar', description: 'Capas reais dos filmes escolhidos para ranquear.', icon: '🎬', accent: 'from-red-600 to-orange-500', items: [['Interestelar', '🚀', 'interestelar.png'], ['Parasita', '🏠', 'parasita.png'], ['Shrek', '🧅', 'shrek.png'], ['Barbie', '🎀'], ['Matrix', '💊', 'matrix.png'], ['Duna', '🏜️', 'duna.png'], ['O Poderoso Chefão', '🍝', 'o-poderoso-chefao.png'], ['Cidade de Deus', '🌇', 'cidade-de-deus.png'], ['A Viagem de Chihiro', '🐉', 'a-viagem-de-chihiro.png'], ['Vingadores Ultimato', '🦸', 'vingadores-ultimato.png'], ['Corra!', '🫣', 'corra.png'], ['Clube da Luta', '🥊', 'clube-da-luta.png'], ['Mad Max', '🏎️', 'mad-max.png'], ['Toy Story', '🤠', 'toy-story.png'], ['Pantera Negra', '🐾', 'pantera-negra.png'], ['Tudo em Todo Lugar', '🌌', 'tudo-em-todo-lugar.png']] },
  { id: 'food', title: 'Comidas favoritas', description: '16 sabores brasileiros e do mundo para decidir o topo.', icon: '🍔', accent: 'from-amber-500 to-rose-500', items: [['Pizza', '🍕'], ['Sushi', '🍣'], ['Hambúrguer', '🍔'], ['Açaí', '🫐'], ['Brigadeiro', '🍫'], ['Coxinha', '🍗'], ['Feijoada', '🫘'], ['Lasanha', '🍝'], ['Pão de queijo', '🧀'], ['Pastel', '🥟'], ['Tacos', '🌮'], ['Ramen', '🍜'], ['Churrasco', '🥩'], ['Sorvete', '🍨'], ['Pudim', '🍮'], ['Batata frita', '🍟']] },
  { id: 'anime', title: 'Universo dos animes', description: '16 personagens e títulos que marcaram gerações.', icon: '⚡', accent: 'from-cyan-500 to-fuchsia-600', items: [['Naruto', '🍥'], ['Goku', '🐉'], ['Luffy', '🏴‍☠️'], ['Gojo', '🕶️'], ['Tanjiro', '🌊'], ['Mikasa', '⚔️'], ['Levi', '🪽'], ['Saitama', '👊'], ['Sailor Moon', '🌙'], ['Ichigo', '🟠'], ['Edward Elric', '🦾'], ['Light Yagami', '📓'], ['Spike Spiegel', '🚬'], ['Hinata', '🏐'], ['Eren', '🧣'], ['Frieren', '🪄']] },
];

// ---------- Seletores DOM ----------

const tierContainer = document.getElementById('tier-container');
const poolImagesEl = document.getElementById('pool-images');
const poolEmptyEl = document.getElementById('pool-empty');
const imageUploadEl = document.getElementById('image-upload');
const btnAddRow = document.getElementById('btn-add-row');
const btnDownload = document.getElementById('btn-download');
const btnPublish = document.getElementById('btn-publish');
const btnHub = document.getElementById('btn-hub');
const authArea = document.getElementById('auth-area');
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authClose = document.getElementById('auth-close');
const authMessage = document.getElementById('auth-message');
const editorTitle = document.getElementById('editor-title');
const templateGrid = document.getElementById('template-grid');
const communityFeed = document.getElementById('community-feed');
const communityEmpty = document.getElementById('community-empty');
const publicationCount = document.getElementById('publication-count');

const imageModal = document.getElementById('image-modal');
const modalTitle = document.getElementById('modal-title');
const modalImg = document.getElementById('modal-img');
const modalClose = document.getElementById('modal-close');

let currentModalImageId = null;

// ---------- Hub, autenticação e comunidade ----------

const photoSources = {
  games: [
    'photo-1542751371-adc38448a05e', 'photo-1493711662062-fa541adb3fc8', 'photo-1511512578047-dfb367046420', 'photo-1598550476439-6847785fcea6',
    'photo-1603481546238-487240415921', 'photo-1593305841991-05c297ba4575', 'photo-1550745165-9bc0b252726f', 'photo-1552820728-8b83bb6b773f',
  ],
  movies: [
    'photo-1489599849927-2ee91cede3ba', 'photo-1517604931442-7e0c8ed2963c', 'photo-1485846234645-a62644f84728', 'photo-1500534314209-a25ddb2bd429',
    'photo-1506157786151-b8491531f063', 'photo-1440404653325-ab127d49abc1', 'photo-1595769816263-9b910be24d5f', 'photo-1586899028174-e7098604235b',
  ],
  food: [
    'photo-1565299624946-b28f40a0ae38', 'photo-1579871494447-9811cf80d66c', 'photo-1568901346375-23c9450c58cd', 'photo-1490474418585-ba9bad8fd0ea',
    'photo-1515003197210-e0cd71810b5f', 'photo-1482049016688-2d3e1b311543', 'photo-1504674900247-0877df9cc836', 'photo-1547592180-85f173990554',
  ],
  anime: [
    'photo-1541562232579-512a21360020', 'photo-1528360983277-13d401cdc186', 'photo-1519608487953-e999c86e7459', 'photo-1531058020387-3be344556be6',
    'photo-1522383225653-ed111181a951', 'photo-1518709268805-4e9042af9f23', 'photo-1531501410720-c8d437636169', 'photo-1545569341-9eb8b30979d9',
  ],
};

/** Fotos reais de stock, otimizadas em 320px para os cards da tier list. */
function createTemplateImage(templateId, index, localImage) {
  if (localImage) {
    return `./src/assets/${templateId}/${localImage}`;
  }
  const source = photoSources[templateId][index % photoSources[templateId].length];
  return `https://images.unsplash.com/${source}?auto=format&fit=crop&w=320&h=320&q=85`;
}

function renderTemplates() {
  if (!templateGrid) return;
  templateGrid.innerHTML = templates.map((template) => `
    <article class="group overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-950/50">
      <div class="bg-gradient-to-br ${template.accent} p-4"><span class="text-3xl">${template.icon}</span></div>
      <div class="p-4"><h3 class="font-bold text-white">${template.title}</h3><p class="mt-1 min-h-10 text-sm text-gray-400">${template.description}</p>
        <button data-template-id="${template.id}" class="mt-4 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-bold text-gray-100 transition hover:border-indigo-400 hover:bg-indigo-600">Usar template</button>
      </div>
    </article>`).join('');
  templateGrid.querySelectorAll('[data-template-id]').forEach((button) => button.addEventListener('click', () => loadTemplate(button.dataset.templateId)));
}

function loadTemplate(templateId) {
  const template = templates.find((item) => item.id === templateId);
  if (!template) return;
  Object.values(images).forEach((img) => { if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url); });
  tiers = defaultTiers();
  images = {};
  unassignedIds = [];
  currentListTitle = template.title;
  template.items.forEach(([name, , localImage], index) => {
    const id = `template-${template.id}-${index}`;
    images[id] = { id, name, url: createTemplateImage(template.id, index, localImage) };
    unassignedIds.push(id);
  });
  render();
  document.getElementById('tier-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAuth() {
  if (!authArea) return;
  if (!currentUser) {
    authArea.innerHTML = '<button id="btn-login" class="rounded-lg border border-gray-700 px-3 py-2 text-sm font-bold text-gray-200 transition hover:border-indigo-400 hover:bg-gray-800">Entrar</button>';
    document.getElementById('btn-login').addEventListener('click', () => openAuthModal());
    return;
  }
  authArea.innerHTML = `<div class="flex items-center gap-2"><span class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-sm font-extrabold text-white">${currentUser.avatar}</span><div class="hidden lg:block leading-tight"><p class="max-w-24 truncate text-xs font-bold text-white">${currentUser.name}</p><button id="btn-logout" class="text-[11px] text-gray-400 hover:text-red-400">Sair</button></div></div>`;
  document.getElementById('btn-logout')?.addEventListener('click', logout);
}

function openAuthModal(message = 'Crie uma identidade rápida. Nenhum dado é enviado ou salvo.') {
  authMessage.textContent = message;
  authModal.classList.remove('hidden');
  authModal.classList.add('flex');
  document.getElementById('auth-name').focus();
}

function closeAuthModal() { authModal.classList.add('hidden'); authModal.classList.remove('flex'); }

function logout() { currentUser = null; renderAuth(); }

function publishTierList() {
  if (!currentUser) {
    openAuthModal('Para publicar sua tier list na comunidade, entre com uma conta fictícia.');
    return;
  }
  publications.unshift({ title: currentListTitle, author: currentUser.name, avatar: currentUser.avatar, total: Object.keys(images).length, date: new Date().toLocaleDateString('pt-BR'), template: templates.find((template) => template.title === currentListTitle)?.icon || '🏆' });
  renderCommunity();
  document.getElementById('community-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderCommunity() {
  publicationCount.textContent = `${publications.length} ${publications.length === 1 ? 'publicação' : 'publicações'}`;
  communityEmpty.classList.toggle('hidden', publications.length > 0);
  communityFeed.innerHTML = publications.map((post) => `<article class="rounded-xl border border-gray-800 bg-gray-900 p-5 shadow-lg"><div class="flex items-start gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 font-bold text-white">${post.avatar}</span><div class="min-w-0 flex-1"><p class="font-bold text-white">${post.author}</p><p class="text-xs text-gray-500">Publicado em ${post.date}</p></div><span class="text-2xl">${post.template}</span></div><h3 class="mt-4 text-lg font-extrabold text-white">${post.title}</h3><p class="mt-1 text-sm text-gray-400">${post.total} imagens classificadas</p><div class="mt-4 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-amber-400"></div></article>`).join('');
}

authClose?.addEventListener('click', closeAuthModal);
authModal?.addEventListener('click', (event) => { if (event.target === authModal) closeAuthModal(); });
authForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('auth-name').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const avatar = document.getElementById('auth-avatar').value.trim().slice(0, 2).toUpperCase() || name.charAt(0).toUpperCase();
  if (!name || !email) return;
  currentUser = { name, email, avatar, loggedIn: true };
  renderAuth();
  closeAuthModal();
});
btnPublish?.addEventListener('click', publishTierList);
btnHub?.addEventListener('click', () => document.getElementById('hub-section').scrollIntoView({ behavior: 'smooth' }));

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
  if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
    closeAuthModal();
  }
});

function deleteImage(imageId) {
  if (!images[imageId]) return;

  if (images[imageId].url.startsWith('blob:')) {
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
  if (editorTitle) editorTitle.textContent = currentListTitle;
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
  // O CDN do Unsplash aceita CORS, preservando a exportação da tier list em PNG.
  // As capas oficiais da Steam não precisam desse atributo para serem exibidas.
  if (imgData.url.includes('images.unsplash.com')) img.crossOrigin = 'anonymous';
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
    if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
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

renderTemplates();
renderAuth();
renderCommunity();
render();
