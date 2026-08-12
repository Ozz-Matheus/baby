// Countdown to Sep 19, 2026 at 3:30 PM
const targetDate = new Date('2026-09-19T15:30:00');

function updateCountdown() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
        document.getElementById('cd-days').textContent = '00';
        document.getElementById('cd-hrs').textContent = '00';
        document.getElementById('cd-min').textContent = '00';
        document.getElementById('cd-sec').textContent = '00';
        return;
    }
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hrs').textContent = String(hrs).padStart(2, '0');
    document.getElementById('cd-min').textContent = String(min).padStart(2, '0');
    document.getElementById('cd-sec').textContent = String(sec).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Music toggle
let playing = false;
const audio = document.getElementById('bg-audio');

function toggleMusic() {
    if (playing) {
        audio.pause();
        playing = false;
        document.getElementById('music-icon-on').style.display = 'none';
        document.getElementById('music-icon-off').style.display = 'block';
        document.getElementById('music-btn').style.opacity = '.5';
    } else {
        audio.play().catch(() => { });
        playing = true;
        document.getElementById('music-icon-on').style.display = 'block';
        document.getElementById('music-icon-off').style.display = 'none';
        document.getElementById('music-btn').style.opacity = '1';
    }
}

// Open invitation
function openInvitation() {
  document.getElementById('envelope-overlay').classList.add('hidden');
  const main = document.getElementById('main');
  setTimeout(() => { main.style.opacity = '1'; }, 400);
  setTimeout(initObserver, 600);
  // Autoplay music when invitation opens (user gesture allows it)
  audio.play().then(() => {
    playing = true;
    document.getElementById('music-icon-on').style.display = 'block';
    document.getElementById('music-icon-off').style.display = 'none';
    document.getElementById('music-btn').style.opacity = '1';
  }).catch(() => {
    // Autoplay blocked — button still works manually
  });
}

// Scroll-triggered fade-in
function initObserver() {
  const els = document.querySelectorAll('.fade-up');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

// LISTA DE REGALOS MODAL

// URL de tu Apps Script implementado como Web App
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxv9iAmC_kO7TrcR03zpiM0BOR0rL7Wk_Z4O_46LNYJa1vF7CCng8Bi5xVvCzaMY4dWzw/exec";

let regalosCache = [];
let invitadosCache = [];

function openGiftsModal() {
  document.getElementById('gifts-modal').classList.add('active');
  loadGiftsData();
}

function closeGiftsModal() {
  document.getElementById('gifts-modal').classList.remove('active');
}

// Cargar Datos desde Google Sheets
function loadGiftsData() {
  const loader = document.getElementById('gifts-loader');
  const container = document.getElementById('gifts-list');
  
  loader.style.display = 'block';
  container.style.display = 'none';

  fetch(APPS_SCRIPT_URL)
    .then(res => res.json())
    .then(data => {
      regalosCache = data.regalos || [];
      invitadosCache = data.invitados || [];
      renderGifts();
      loader.style.display = 'none';
      container.style.display = 'flex';
    })
    .catch(err => {
      console.error(err);
      loader.innerHTML = '<p style="color:red; font-size: 0.85rem;">Error al cargar los regalos. Intenta de nuevo.</p>';
    });
}

// Renderizar Tarjetas de Regalos
function renderGifts() {
  const container = document.getElementById('gifts-list');
  container.innerHTML = '';

  if (regalosCache.length === 0) {
    container.innerHTML = '<p>No hay regalos en la lista aún.</p>';
    return;
  }

  regalosCache.forEach(item => {
    const isReserved = Boolean(item.reservadoPor);
    
    const card = document.createElement('div');
    card.className = `gift-card ${isReserved ? 'reserved' : ''}`;

    // Opciones del select de invitados
    let guestOptions = `<option value="">-- Selecciona tu nombre --</option>`;
    invitadosCache.forEach(inv => {
      guestOptions += `<option value="${inv}">${inv}</option>`;
    });

// Obtenemos la URL (considerando posibles variaciones de mayúsculas desde el Apps Script)
    const imageUrl = item.miniatura || item.Miniatura;

    card.innerHTML = `
      <div class="gift-header">
        ${imageUrl ? `<img src="${imageUrl}" alt="${item.nombre}" class="gift-img" loading="lazy" />` : ''}
        <div class="gift-info">
          <div class="gift-title font-caps">${item.nombre}</div>
          ${item.link && !isReserved ? `<a href="${item.link}" target="_blank" class="gift-link">Ver sugerencia</a>` : ''}
          </div>
        <span class="font-display gift-status ${isReserved ? 'taken' : 'free'}">
          ${isReserved ? 'Reservado' : 'Disponible'}
        </span>
      </div>

      ${isReserved ? `
        <span class="font-caps" style="font-size: 0.75rem; color: #555; margin: 0;">
          <strong class="font-display"><hr></strong>
        </span>
      ` : `
        <div class="gift-action-box" id="action-box-${item.id}">
          <select id="select-guest-${item.id}" class="gift-select">
            ${guestOptions}
          </select>
          <button class="button" onclick="reserveGift('${item.id}')">
            Apartar este Regalo
          </button>
        </div>
      `}
    `;

    container.appendChild(card);
  });
}

// Procesar Reservado
function reserveGift(idRegalo) {
  const select = document.getElementById(`select-guest-${idRegalo}`);
  const nombreInvitado = select.value;

  if (!nombreInvitado) {
    alert("Por favor selecciona tu nombre del desplegable.");
    return;
  }

  const actionBox = document.getElementById(`action-box-${idRegalo}`);
  actionBox.innerHTML = `<p style="font-size: 0.8rem; color: #555;">Guardando reservado...</p>`;

  // POST a Google Apps Script
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors', // Apps Script no-cors redirect handling
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idRegalo: idRegalo, nombreInvitado: nombreInvitado })
  })
  .then(() => {
    alert(`¡Gracias ${nombreInvitado}! Has reservado este regalo exitosamente.`);
    loadGiftsData(); // Recargar datos para actualizar la UI
  })
  .catch(err => {
    console.error(err);
    alert("Hubo un problema al reservar el regalo. Intenta nuevamente.");
    loadGiftsData();
  });
}