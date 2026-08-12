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

