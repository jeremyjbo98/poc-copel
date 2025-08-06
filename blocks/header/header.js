import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function isLoggedIn() {
  return document.cookie.includes('loggedIn=true');
}

function createLockIcon(open = false) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "lock-icon");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "white");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");

  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  if (open) {
    path.setAttribute("d", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM7 11V7a5 5 0 019.9-1");
  } else {
    path.setAttribute("d", "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM16 11V7a4 4 0 00-8 0v4");
  }

  svg.appendChild(path);
  return svg;
}

function initLogin() {
  const loginButton = document.querySelector('.nav-tools .button[href="/"]');
  const loginPanelElement = document.getElementById('login-panel');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const submitBtn = document.getElementById('login-submit');
  const closeBtn = document.querySelector('.login-close');
  const errorMessage = document.getElementById('login-error');

  const updateButtonText = () => {
    loginButton.textContent = isLoggedIn() ? 'Cerrar sesión' : 'Iniciar sesión';
  };

  const hideLoginPanel = () => {
    loginPanelElement.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
  };

  const showError = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', hideLoginPanel);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showError('Debes ingresar ambos campos');
        return;
      }

      if (email === 'admin' && password === 'admin') {
        document.cookie = 'loggedIn=true; path=/; max-age=86400';
        hideLoginPanel();
        updateButtonText();
      
        const redirectTo = localStorage.getItem('redirectAfterLogin');
        if (redirectTo) {
          localStorage.setItem('loginSuccess', 'true');
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectTo;
        } else {
          localStorage.setItem('loginSuccess', 'true');
          window.location.href = '/';
          showToast('Inicio de sesión exitoso', 'success');
        }        
      }      
    });
  }

  if (loginButton) {
    updateButtonText();

    loginButton.addEventListener('click', (e) => {
      e.preventDefault();
    
      if (isLoggedIn()) {
        document.cookie = 'loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        localStorage.setItem('logoutSuccess', 'true');
        window.location.href = '/';
      } else {
        localStorage.removeItem('redirectAfterLogin');
        showLoginPanel();
      }
    });    
  }
}

function showLoginPanel() {
  const loginPanelElement = document.getElementById('login-panel');
  const errorMessage = document.getElementById('login-error');

  loginPanelElement.classList.remove('hidden');
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';
}

async function markProtectedLinksInHeader() {
  const links = document.querySelectorAll('.nav-tools a, .nav-sections a');

  for (const link of links) {
    try {
      const res = await fetch(link.href);
      const html = await res.text();

      if (html.includes('meta name="protected-page" content="true"')) {
        const lockIcon = createLockIcon(isLoggedIn());
        lockIcon.title = isLoggedIn()
          ? 'Página protegida (sesión iniciada)'
          : 'Página protegida (requiere inicio de sesión)';
        link.appendChild(lockIcon);

        if (!isLoggedIn()) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.setItem('redirectAfterLogin', link.href);
            showLoginPanel();
          });          
        }
      }
    } catch (err) {
    }
  }
}

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.classList.remove('hidden');
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) {
      container.classList.add('hidden');
    }
  }, duration);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  const loginPanel = document.createElement('div');
  loginPanel.id = 'login-panel';
  loginPanel.classList.add('login-panel', 'hidden');
  loginPanel.innerHTML = `
    <div class="login-panel-overlay"></div>
    <div class="login-panel-content">
      <button class="login-close" aria-label="Cerrar">✕</button>
      <h2>Inicia sesión</h2>
      <label for="login-email">Correo electrónico</label>
      <input type="email" id="login-email" placeholder="correo@ejemplo.com" required>
      <label for="login-password">Contraseña</label>
      <input type="password" id="login-password" placeholder="••••••••" required>
      <button id="login-submit" class="button login-button">Entrar</button>
      <span id="login-error" class="login-error hidden"></span>
    </div>
  `;
  document.body.appendChild(loginPanel);

  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container hidden';
  document.body.appendChild(toastContainer);

  initLogin();
  markProtectedLinksInHeader();

  if (localStorage.getItem('loginSuccess') === 'true') {
    localStorage.removeItem('loginSuccess');
    showToast('Inicio de sesión exitoso', 'success');
  }  

  if (localStorage.getItem('logoutSuccess') === 'true') {
    localStorage.removeItem('logoutSuccess');
    showToast('Has cerrado sesión correctamente', 'success');
  }
}
