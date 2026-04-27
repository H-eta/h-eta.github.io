/* ── Config ── */
// List your project folders here, in the order you want them shown.
// Each folder must exist inside /projects/ and contain a meta.json and a cover.png
const PROJECTS = [
  'project-1',
  'project-2',
  'project-3',
  'project-4',
  'project-5',
  'project-6',
  'project-7',
  'project-8',
  'project-9',
  'project-10',
  // Add more here: 'project-5', ...
];

/* ── State ── */
let currentIndex = null;
let projectData  = [];

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadProjects();
  renderGrid();
  setupLightbox();
  updateProjectCount();
  setupFilters();
});

/* ── Load all meta.json files ── */
async function loadProjects() {
  const promises = PROJECTS.map(async (folder) => {
    try {
      const res  = await fetch(`projects/${folder}/meta.json`);
      const meta = await res.json();
      return { folder, ...meta };
    } catch (e) {
      console.warn(`Could not load projects/${folder}/meta.json`);
      return null;
    }
  });
  projectData = (await Promise.all(promises)).filter(Boolean);
}

/* ── Render work grid ── */
function renderGrid() {
  const grid = document.getElementById('work-grid');
  grid.innerHTML = '';

  projectData.forEach((project, i) => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.setAttribute('data-index', i);

    const coverSrc = `projects/${project.folder}/cover.png`;

    card.innerHTML = `
      <div class="work-thumb">
        <img src="${coverSrc}" alt="${project.title}" loading="lazy"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <span class="work-thumb-ph" style="display:none;">No image</span>
      </div>
      <div class="work-body">
        <div class="work-body-top">
          <span class="work-title">${project.title}</span>
          <span class="work-year">${project.year || ''}</span>
        </div>
        ${project.tag ? `<span class="work-tag">${project.tag}</span>` : ''}
      </div>
    `;

    card.addEventListener('click', () => openLightbox(i));
    grid.appendChild(card);
  });
}

/* ── Filter by discipline ── */
function setupFilters() {
  const buttons = document.querySelectorAll('.discipline[data-filter]');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      const cards  = document.querySelectorAll('.work-card');

      cards.forEach(card => {
        const tag = (card.querySelector('.work-tag')?.textContent || '').toLowerCase();
        const show = filter === 'all' || tag.includes(filter);
        card.style.display = show ? '' : 'none';
      });

      // scroll to work section
      document.getElementById('work').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ── Update project count in section bar ── */
function updateProjectCount() {
  const el = document.getElementById('project-count');
  if (el) el.textContent = `${projectData.length} project${projectData.length !== 1 ? 's' : ''}`;
}

/* ── Lightbox ── */
function setupLightbox() {
  const lb = document.getElementById('lightbox');

  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLightbox();
  });

  document.getElementById('lb-zoom').addEventListener('click', closeZoom);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('lb-zoom').classList.contains('open')) closeZoom();
      else closeLightbox();
    }
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  });

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lb-next').addEventListener('click', () => navigateLightbox(1));
}

function openLightbox(index) {
  currentIndex = index;
  renderLightboxContent(index);
  const lb = document.getElementById('lightbox');
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
  // Pause any playing media
  lb.querySelectorAll('video, audio').forEach(m => m.pause());
  currentIndex = null;
}

function navigateLightbox(dir) {
  if (currentIndex === null) return;
  const next = (currentIndex + dir + projectData.length) % projectData.length;
  // Pause media before switching
  document.getElementById('lightbox').querySelectorAll('video, audio').forEach(m => m.pause());
  openLightbox(next);
}

function renderLightboxContent(index) {
  const project = projectData[index];
  if (!project) return;

  // Header
  document.getElementById('lb-title').textContent = project.title;
  document.getElementById('lb-tag').textContent   = project.tag  || '';
  document.getElementById('lb-year').textContent  = project.year || '';

  // Prev / Next buttons (always enabled — navigation wraps around)
  document.getElementById('lb-prev').disabled = false;
  document.getElementById('lb-next').disabled = false;

  // Sidebar
  const descEl = document.getElementById('lb-desc');
  descEl.textContent = project.description || '';
  descEl.style.display = project.description ? 'block' : 'none';

  const linkEl = document.getElementById('lb-link');
  if (project.link && project.link.url) {
    linkEl.href        = project.link.url;
    linkEl.textContent = (project.link.label || 'View project') + ' ↗';
    linkEl.style.display = 'inline-flex';
  } else {
    linkEl.style.display = 'none';
  }

  // Media
  const mediaEl = document.getElementById('lb-media');
  mediaEl.innerHTML = '';

  const media = project.media || [];
  const images = media.filter(i => i.type === 'image');
  const nonImages = media.filter(i => i.type !== 'image');

  // Image grid
  if (images.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'lb-image-grid';

    images.forEach(item => {
      const base = `projects/${project.folder}/${item.src}`;
      const cell = document.createElement('div');
      cell.className = 'lb-image-grid-item';
      const img = document.createElement('img');
      img.src = base;
      img.alt = project.title;
      img.loading = 'lazy';
      cell.appendChild(img);
      if (item.scale) img.style.transform = `scale(${item.scale})`;
      cell.addEventListener('click', () => openZoom(base));
      grid.appendChild(cell);
    });

    mediaEl.appendChild(grid);
  }

  // Videos and audio below
  nonImages.forEach(item => {
    const base = `projects/${project.folder}/${item.src}`;
    const wrap = document.createElement('div');
    wrap.className = 'lb-media-item';

    if (item.type === 'youtube') {
      const url = item.src;
      const id = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/)?.[1];
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.cssText = 'width:100%;aspect-ratio:16/9;border:none;display:block;';
      wrap.appendChild(iframe);

    } else if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = base;
      video.controls = true;
      video.preload = 'metadata';
      video.playsInline = true;
      wrap.appendChild(video);

    } else if (item.type === 'audio') {
      const label = document.createElement('p');
      label.textContent = item.label || item.src;
      label.style.cssText = 'font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:0.75rem;';
      const audio = document.createElement('audio');
      audio.src = base;
      audio.controls = true;
      audio.preload = 'metadata';
      audio.style.width = '100%';
      wrap.appendChild(label);
      wrap.appendChild(audio);
    }

    mediaEl.appendChild(wrap);
  });

  mediaEl.scrollTop = 0;
}

function openZoom(src) {
  const zoom = document.getElementById('lb-zoom');
  document.getElementById('lb-zoom-img').src = src;
  zoom.classList.add('open');
}

function closeZoom() {
  const zoom = document.getElementById('lb-zoom');
  zoom.classList.remove('open');
  document.getElementById('lb-zoom-img').src = '';
}
