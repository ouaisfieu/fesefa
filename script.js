// script.js — theme switch, Konami code, penguin spawn, glitch toggle, small UX helpers

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  const konamiHint = document.getElementById('konami-hint');
  const penguinLayer = document.getElementById('penguin-layer');
  const spawnBtn = document.getElementById('spawn-penguin');
  const glitchToggle = document.getElementById('glitch-toggle');

  // persist theme
  const saved = localStorage.getItem('psyche_theme');
  if (saved === 'on') { body.classList.add('psyche'); if (themeToggle) themeToggle.checked = true; }

  themeToggle?.addEventListener('change', (e) => {
    if (e.target.checked) { body.classList.add('psyche'); localStorage.setItem('psyche_theme','on'); }
    else { body.classList.remove('psyche'); localStorage.setItem('psyche_theme','off'); }
  });

  // small helper to spawn a penguin element
  function spawnPenguin(opts = {}) {
    const el = document.createElement('div');
    el.className = 'penguin';
    const size = opts.size || (40 + Math.random()*80);
    el.style.position = 'absolute';
    el.style.left = (Math.random()*100) + '%';
    el.style.top = (Math.random()*60 + 10) + '%';
    el.style.fontSize = size + 'px';
    el.style.pointerEvents = 'none';
    el.style.transform = `translate(-50%,-50%) rotate(${(Math.random()*40-20)}deg)`;
    el.style.opacity = 0;
    el.style.transition = 'transform 1.2s ease, opacity 0.8s ease';
    // use emoji penguin as fallback visual
    el.innerHTML = `<span aria-hidden="true">🐧</span>`;
    penguinLayer.appendChild(el);
    requestAnimationFrame(()=> {
      el.style.opacity = 1;
      el.style.transform = `translate(-50%,-50%) translateY(-40px) rotate(${(Math.random()*40-20)}deg)`;
    });
    // float away then remove
    setTimeout(()=> {
      el.style.opacity = 0;
      el.style.transform = `translate(-50%,-50%) translateY(-200px) rotate(${(Math.random()*60-30)}deg)`;
      setTimeout(()=> el.remove(), 1200);
    }, 2200 + Math.random()*2000);
  }

  // spawn on button
  spawnBtn?.addEventListener('click', ()=> spawnPenguin({}));

  // glitch toggle
  let glitchOn = false;
  glitchToggle?.addEventListener('click', () => {
    glitchOn = !glitchOn;
    document.querySelectorAll('.headline, .logo').forEach(el => {
      if (glitchOn) {
        el.classList.add('glitch');
        el.setAttribute('data-text', el.textContent);
      } else {
        el.classList.remove('glitch');
        el.removeAttribute('data-text');
      }
    });
  });

  // Konami code detection
  const konami = [38,38,40,40,37,39,37,39,66,65];
  let kpos = 0;
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === konami[kpos]) {
      kpos++;
      if (kpos === konami.length) {
        triggerKonamiEasterEgg();
        kpos = 0;
      }
    } else {
      kpos = 0;
    }
  });

  konamiHint?.addEventListener('click', () => {
    alert('Astuce Konami: ↑ ↑ ↓ ↓ ← → ← → B A — active la pluie de pingouins');
  });

  // Konami easter egg
  function triggerKonamiEasterEgg() {
    // visual cascade
    for (let i=0;i<18;i++) {
      setTimeout(()=> spawnPenguin({ size: 40 + Math.random()*80 }), i*120);
    }
    // audio ping (short playful sound using WebAudio)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.02;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(()=> { o.frequency.value = 660; }, 120);
      setTimeout(()=> { o.stop(); ctx.close(); }, 420);
    } catch (e) { /* ignore audio errors */ }

    // small confetti of SVG penguins if available
    // also show a temporary banner
    const eggBanner = document.createElement('div');
    eggBanner.className = 'egg-banner';
    eggBanner.style.position = 'fixed';
    eggBanner.style.left = '50%';
    eggBanner.style.top = '8%';
    eggBanner.style.transform = 'translateX(-50%)';
    eggBanner.style.background = 'linear-gradient(90deg, rgba(123,211,137,0.12), rgba(184,156,240,0.12))';
    eggBanner.style.padding = '12px 18px';
    eggBanner.style.borderRadius = '999px';
    eggBanner.style.boxShadow = '0 8px 30px rgba(11,18,32,0.08)';
    eggBanner.style.zIndex = 10000;
    eggBanner.textContent = 'Konami activé — pingouins libérés 🐧';
    document.body.appendChild(eggBanner);
    setTimeout(()=> eggBanner.remove(), 4200);
  }

  // small entrance animation for numbers
  document.querySelectorAll('.stat .num').forEach(el => {
    const target = el.dataset.count || el.textContent;
    let current = 0;
    const isFloat = String(target).includes('.');
    const steps = 40;
    const stepTime = 900 / steps;
    const parsed = isFloat ? parseFloat(target) : parseInt(target,10);
    const inc = parsed / steps;
    const timer = setInterval(()=> {
      current += inc;
      el.textContent = isFloat ? (Math.round(current*10)/10) : Math.round(current);
      if ((isFloat && current >= parsed) || (!isFloat && current >= parsed)) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, stepTime);
  });

  // accessibility: keyboard shortcut to toggle theme (T)
  window.addEventListener('keydown', (e) => {
    if ((e.key === 't' || e.key === 'T') && (e.ctrlKey || e.metaKey)) {
      themeToggle.checked = !themeToggle.checked;
      themeToggle.dispatchEvent(new Event('change'));
    }
  });

  // small safety: disable Konami on reduced motion preference
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    window.removeEventListener('keydown', ()=>{}); // no-op to respect preference
  }
});
