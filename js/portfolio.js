/* ===================================================================
   VijayKumar Yadav — Portfolio
   Shared interactions + GSAP animations (loaded on every page)
=================================================================== */

/* ---------- Mobile offcanvas menu ---------- */
function toggleMobileMenu() {
  const menu = document.querySelector('.offcanvas-menu');
  const overlay = document.querySelector('.offcanvas-overlay');
  const toggle = document.querySelector('.mobile-menu-toggle i');
  if (!menu) return;

  const isOpen = menu.classList.toggle('open');
  overlay.classList.toggle('open');

  document.querySelectorAll('.offcanvas-nav-item').forEach((item, i) => {
    if (isOpen) {
      setTimeout(() => item.classList.add('animate'), i * 80);
    } else {
      item.classList.remove('animate');
    }
  });

  if (toggle) {
    toggle.classList.toggle('fa-bars', !isOpen);
    toggle.classList.toggle('fa-times', isOpen);
  }
}
window.toggleMobileMenu = toggleMobileMenu;

/* ---------- Typing animation (home only) ---------- */
function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const texts = ['Frontend Developer', 'React.js Developer', 'Web Developer', '3D / GSAP Animator'];
  let textIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const current = texts[textIndex];
    el.textContent = deleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);
    charIndex += deleting ? -1 : 1;

    let speed = deleting ? 45 : 95;
    if (!deleting && charIndex === current.length) {
      speed = 1800; deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      textIndex = (textIndex + 1) % texts.length;
      speed = 400;
    }
    setTimeout(tick, speed);
  }
  tick();
}

/* ---------- Lightweight scroll reveal (fallback, all pages) ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Skill bars fill on scroll ---------- */
function initSkillBars() {
  const fills = document.querySelectorAll('.skillbar-fill');
  if (!fills.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('filled');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach((f) => io.observe(f));
}

/* ---------- Background particle canvas ---------- */
function initParticles() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;opacity:0.35;';
  document.body.appendChild(canvas);

  let w, h, particles;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  function build() {
    const count = Math.min(70, Math.floor(window.innerWidth / 22));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    }));
  }
  resize(); build();
  window.addEventListener('resize', () => { resize(); build(); });

  function loop() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = '#4facfe';
      ctx.fill();
      // link nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(79,172,254,${(1 - dist / 120) * 0.18})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
}

/* ---------- GSAP animations ---------- */
function initGsap() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance */
  gsap.from('[data-hero]', {
    y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
  });

  /* Generic reveal-on-scroll for any .gsap-up element.
     immediateRender:false => elements are NEVER left hidden if a trigger
     misfires (e.g. offset by the pinned carousel). */
  gsap.utils.toArray('.gsap-up').forEach((el) => {
    gsap.fromTo(el,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power2.out',
        immediateRender: false, overwrite: 'auto',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', once: true },
      });
  });

  /* Staggered grids (skills / stats / portfolio cards) */
  gsap.utils.toArray('[data-stagger]').forEach((group) => {
    gsap.fromTo(group.children,
      { y: 50, opacity: 0, scale: 0.92 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power2.out',
        immediateRender: false, overwrite: 'auto',
        scrollTrigger: { trigger: group, start: 'top 90%', toggleActions: 'play none none none', once: true },
      });
  });

  /* Marquee infinite scroll */
  const track = document.querySelector('.marquee-track');
  if (track) {
    gsap.to(track, { xPercent: -50, repeat: -1, duration: 22, ease: 'none' });
  }

  /* Horizontal project carousel (pinned) */
  const wrapper = document.querySelector('.carousel-wrapper');
  if (wrapper) {
    const scrollLen = () => wrapper.scrollWidth - window.innerWidth;
    gsap.to(wrapper, {
      x: () => -scrollLen(),
      ease: 'none',
      scrollTrigger: {
        trigger: '.carousel-container',
        start: 'top top',
        end: () => '+=' + scrollLen(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }

  /* 3D capsule stack entrance */
  gsap.utils.toArray('.capsule').forEach((cap) => {
    gsap.fromTo(cap,
      { scale: 0.78, rotationY: 22, opacity: 0.2 },
      {
        scale: 1, rotationY: 0, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: cap.closest('.stack-section'), start: 'top 75%', end: 'top 25%', scrub: 1 },
      });
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- Lottie smile badge (home only) ---------- */
function initLottie() {
  const el = document.getElementById('lottie-animation');
  if (el && typeof lottie !== 'undefined') {
    lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: './js/smile.json',
    });
  }
}

/* ---------- Contact form ---------- */
function initContactForm() {
  const form = document.querySelector('form[data-contact]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get('name') || !data.get('email') || !data.get('message')) {
      alert('Please fill in all fields.');
      return;
    }
    alert('Thank you for your message! I will get back to you soon.');
    form.reset();
  });
}

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTyping();
  initReveal();
  initSkillBars();
  initParticles();
  initLottie();
  initContactForm();
  initGsap();
});
