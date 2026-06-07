(function initCursor() {
  const cursor     = document.createElement('div');
  const cursorDot  = document.createElement('div');

  cursor.id    = 'custom-cursor';
  cursorDot.id = 'cursor-dot';

  document.body.appendChild(cursor);
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let curX   = 0, curY   = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // dot segue instantaneamente
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
  });

  // cursor anel segue com lag suave
  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // expande sobre elementos clicáveis
  const clickables = 'a, button, .procedimento, .pilar-item, .item, .home-btn, .btn-whatsapp';
  document.querySelectorAll(clickables).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
  });
})();




(function initHeader() {
  const header = document.querySelector('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    // fundo mais escuro ao sair do topo
    if (current > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // esconde ao rolar para baixo, mostra ao rolar para cima
    if (current > lastScroll && current > 120) {
      header.classList.add('header-hidden');
    } else {
      header.classList.remove('header-hidden');
    }

    lastScroll = current <= 0 ? 0 : current;
  }, { passive: true });
})();



(function initNav() {
  // smooth scroll
  document.querySelectorAll('.menu-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      const offset = document.querySelector('header').offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // link ativo via IntersectionObserver
  const sections = document.querySelectorAll('section[id], div[id]');
  const links    = document.querySelectorAll('.menu-links a');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.menu-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();



(function initReveal() {
  
  const autoTargets = [
    '#home .home-inner',
    '#atuacao h2',
    '#estetica .area-header',   '#estetica .procedimento',
    '#performance .area-header','#performance .procedimento',
    '#cirurgicos .area-header', '#cirurgicos .procedimento',
    '#foto-diferencial img',
    '#autoridade blockquote',
    '#contato .contato-inner',
    'footer',
  ];

  autoTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.dataset.reveal = '';
      el.dataset.revealDelay = i * 90; 
    });
  });

  // também marca os [data-reveal] já existentes no HTML
  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    if (!el.dataset.revealDelay) el.dataset.revealDelay = 0;
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = parseInt(entry.target.dataset.revealDelay) || 0;
      setTimeout(() => {
        entry.target.classList.add('revealed');
      }, delay);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
})();




(function initCounter() {
  const el = document.getElementById('contador-anos');
  if (!el) return;

  let started = false;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || started) return;
    started = true;

    const target   = 20;
    const duration = 1800; 
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }

    requestAnimationFrame(tick);
    obs.disconnect();
  }, { threshold: 0.5 });

  obs.observe(el);
})();




(function initParallax() {
  // só em desktop (evita problema em mobile com vh)
  if (window.innerWidth < 768) return;

  const fotoDif = document.querySelector('#foto-diferencial img');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // parallax na foto diferencial
    if (fotoDif) {
      const rect   = fotoDif.closest('section, div').getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const offset = (window.innerHeight / 2 - center) * 0.12;
      fotoDif.style.transform = `translateY(${offset}px) scale(1.04)`;
    }
  }, { passive: true });
})();




(function initRipple() {
  document.querySelectorAll('.procedimento').forEach(card => {
    card.addEventListener('click', function(e) {
      const existing = this.querySelector('.ripple');
      if (existing) existing.remove();

      const ripple = document.createElement('span');
      ripple.className = 'ripple';

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size/2}px;
        top:${e.clientY - rect.top  - size/2}px;
      `;

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
})();




(function initTyping() {
  const sub = document.querySelector('.home-sub');
  if (!sub) return;

  const text = sub.innerHTML; 
  sub.innerHTML = '';
  sub.style.opacity = '1'; 

  setTimeout(() => {
    sub.innerHTML = text; 
  }, 1100);
})();





(function initLinhaAutoridade() {
  const autoridade = document.querySelector('#autoridade');
  if (!autoridade) return;
 
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      autoridade.classList.add('linha-visivel');
      obs.disconnect();
    }
  }, { threshold: 0.3 });
 
  obs.observe(autoridade);
})();



document.querySelectorAll('.procedimento').forEach(card => {
  card.addEventListener('touchstart', function() {
    this.classList.add('touch-shine');
    setTimeout(() => this.classList.remove('touch-shine'), 700);
  }, { passive: true });
});

