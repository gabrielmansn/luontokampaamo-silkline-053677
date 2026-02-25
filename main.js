/* ============================================
   LUONTOKAMPAAMO SILKLINE – JavaScript
   ============================================ */

'use strict';

// ---- NAVIGAATIO ----
const hamburger    = document.getElementById('hamburger');
const navMenu      = document.getElementById('nav-menu');
const siteHeader   = document.querySelector('.site-header');
const navLinks     = document.querySelectorAll('.nav-menu .nav-link');

// Hampurilaisvalikko avaa/sulkee
hamburger?.addEventListener('click', () => {
  const onAuki = navMenu.classList.toggle('auki');
  hamburger.classList.toggle('aktiivinen');
  hamburger.setAttribute('aria-expanded', onAuki.toString());
  document.body.style.overflow = onAuki ? 'hidden' : '';
});

// Suljetaan valikko kun navigointilinkkiä klikataan
navLinks.forEach(linkki => {
  linkki.addEventListener('click', () => {
    navMenu.classList.remove('auki');
    hamburger?.classList.remove('aktiivinen');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Suljetaan valikko kun klikataan ulkopuolelle
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('auki') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    navMenu.classList.remove('auki');
    hamburger?.classList.remove('aktiivinen');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// Näppäimistö: Escape sulkee valikon
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu.classList.contains('auki')) {
    navMenu.classList.remove('auki');
    hamburger?.classList.remove('aktiivinen');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    hamburger?.focus();
  }
});

// ---- HEADER SCROLL ----
const headerScrollHandler = () => {
  if (window.scrollY > 40) {
    siteHeader?.classList.add('scrolled');
  } else {
    siteHeader?.classList.remove('scrolled');
  }
};

window.addEventListener('scroll', headerScrollHandler, { passive: true });
headerScrollHandler();

// ---- SCROLL-ANIMAATIOT ----
const initScrollAnimations = () => {
  const animoitavat = [
    '.trust-card',
    '.palvelu-card',
    '.galleria-item',
    '.hinnasto-kategoria',
    '.meista-kuva-wrapper',
    '.meista-teksti',
    '.badge',
    '.tieto-rivi',
    '.lomake-wrapper',
    '.aukiolo-info',
  ];

  const elementit = document.querySelectorAll(animoitavat.join(', '));

  elementit.forEach(el => {
    el.classList.add('fade-in');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Porrastettu animaatio saman vanhemman lapsille
          const siblings = Array.from(entry.target.parentElement.children).filter(
            el => el.classList.contains('fade-in')
          );
          const delay = siblings.indexOf(entry.target) * 80;

          setTimeout(() => {
            entry.target.classList.add('nakyvissa');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elementit.forEach(el => observer.observe(el));
};

// Käytetään reduced-motion käyttäjillä yksinkertaistettua versiota
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.fade-in').forEach(el => {
    el.classList.add('nakyvissa');
  });
} else {
  initScrollAnimations();
}

// ---- YHTEYDENOTTOLOMAKE ----
const lomake     = document.getElementById('yhteydenotto-lomake');
const viestiEl   = document.getElementById('lomake-viesti');
const lahetaNappi = document.getElementById('laheta-nappi');

const naytaViesti = (teksti, tyyppi) => {
  viestiEl.textContent = teksti;
  viestiEl.className = `lomake-viesti ${tyyppi}`;
  viestiEl.classList.remove('hidden');

  // Vieritä viestiin
  viestiEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Piilota viesti 8 sekunnin kuluttua
  if (tyyppi === 'onnistuminen') {
    setTimeout(() => {
      viestiEl.classList.add('hidden');
    }, 8000);
  }
};

const asetaNapinTila = (lataa) => {
  if (!lahetaNappi) return;
  const tekstiEl = lahetaNappi.querySelector('.btn-teksti');
  lahetaNappi.disabled = lataa;
  if (tekstiEl) {
    tekstiEl.textContent = lataa ? 'Lähetetään...' : 'Lähetä viesti';
  }
  lahetaNappi.style.opacity = lataa ? '0.7' : '1';
};

const validoiLomake = () => {
  const nimi = document.getElementById('nimi')?.value.trim();
  const sahkoposti = document.getElementById('sahkoposti')?.value.trim();
  const viesti = document.getElementById('viesti')?.value.trim();

  if (!nimi) {
    naytaViesti('Täytä nimesi ennen lähettämistä.', 'virhe');
    document.getElementById('nimi')?.focus();
    return false;
  }

  if (!sahkoposti || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sahkoposti)) {
    naytaViesti('Tarkista sähköpostiosoitteesi.', 'virhe');
    document.getElementById('sahkoposti')?.focus();
    return false;
  }

  if (!viesti || viesti.length < 5) {
    naytaViesti('Kirjoita viestisi ennen lähettämistä.', 'virhe');
    document.getElementById('viesti')?.focus();
    return false;
  }

  return true;
};

lomake?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!validoiLomake()) return;

  asetaNapinTila(true);
  viestiEl.classList.add('hidden');

  const formData = new FormData(lomake);

  try {
    const vastaus = await fetch(lomake.action, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (vastaus.ok) {
      naytaViesti(
        '✓ Kiitos viestistäsi! Otamme sinuun yhteyttä mahdollisimman pian.',
        'onnistuminen'
      );
      lomake.reset();
    } else {
      const data = await vastaus.json().catch(() => ({}));
      const virheViesti = data?.errors?.map(err => err.message).join(', ')
        || 'Viestin lähetys epäonnistui. Yritä myöhemmin uudelleen.';
      naytaViesti(virheViesti, 'virhe');
    }
  } catch (err) {
    naytaViesti(
      'Yhteysvirhe. Tarkista internet-yhteys ja yritä uudelleen, tai ota yhteyttä puhelimitse.',
      'virhe'
    );
    console.error('Lomakkeen lähetysvirhe:', err);
  } finally {
    asetaNapinTila(false);
  }
});

// ---- FOOTER VUOSILUKU ----
const vuosiEl = document.getElementById('vuosi');
if (vuosiEl) {
  vuosiEl.textContent = new Date().getFullYear();
}

// ---- AKTIIVINEN NAVIGOINTILINKIN KOROSTUS ----
const sections = document.querySelectorAll('section[id]');

const highlightNav = () => {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const linkki = document.querySelector(`.nav-link[href="#${id}"]`);

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(l => l.classList.remove('nav-link--active'));
      linkki?.classList.add('nav-link--active');
    }
  });
};

window.addEventListener('scroll', highlightNav, { passive: true });

// ---- GALLERIA LIGHTBOX (yksinkertainen) ----
const galleryItems = document.querySelectorAll('.galleria-item');

const createLightbox = () => {
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Kuvan suurennos');
  lb.style.cssText = `
    display:none;
    position:fixed;
    inset:0;
    background:rgba(44,59,45,0.92);
    z-index:9999;
    align-items:center;
    justify-content:center;
    padding:2rem;
    cursor:zoom-out;
  `;

  const img = document.createElement('img');
  img.style.cssText = `
    max-width:90vw;
    max-height:88vh;
    object-fit:contain;
    border-radius:8px;
    box-shadow:0 24px 64px rgba(0,0,0,0.4);
    animation:fadeUp 0.3s ease;
  `;

  const suljeNappi = document.createElement('button');
  suljeNappi.setAttribute('aria-label', 'Sulje kuva');
  suljeNappi.style.cssText = `
    position:absolute;
    top:1.5rem;
    right:1.5rem;
    background:rgba(249,245,238,0.15);
    border:1px solid rgba(249,245,238,0.3);
    color:#F9F5EE;
    width:44px;
    height:44px;
    border-radius:50%;
    cursor:pointer;
    font-size:1.4rem;
    display:flex;
    align-items:center;
    justify-content:center;
    transition:background 0.2s;
  `;
  suljeNappi.innerHTML = '&times;';
  suljeNappi.addEventListener('mouseenter', () => {
    suljeNappi.style.background = 'rgba(249,245,238,0.25)';
  });
  suljeNappi.addEventListener('mouseleave', () => {
    suljeNappi.style.background = 'rgba(249,245,238,0.15)';
  });

  lb.appendChild(img);
  lb.appendChild(suljeNappi);
  document.body.appendChild(lb);

  const sulje = () => {
    lb.style.display = 'none';
    document.body.style.overflow = '';
    img.src = '';
  };

  lb.addEventListener('click', (e) => {
    if (e.target === lb) sulje();
  });

  suljeNappi.addEventListener('click', sulje);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.style.display === 'flex') sulje();
  });

  return { lb, img };
};

if (galleryItems.length) {
  const { lb, img: lbImg } = createLightbox();

  galleryItems.forEach(item => {
    const kuva = item.querySelector('.galleria-img');
    if (!kuva) return;

    item.style.cursor = 'zoom-in';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Suurenna kuva: ${kuva.alt || 'galleriakuva'}`);

    const avaaLightbox = () => {
      lbImg.src = kuva.src;
      lbImg.alt = kuva.alt;
      lb.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setTimeout(() => lbImg.focus?.(), 50);
    };

    item.addEventListener('click', avaaLightbox);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        avaaLightbox();
      }
    });
  });
}