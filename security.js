(() => {
  'use strict';

  const BLOCKED_MESSAGE = 'Las herramientas de desarrollador están deshabilitadas en este simulador.';

  function notify(message = BLOCKED_MESSAGE) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(notify._timer);
    notify._timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function isBlockedShortcut(e) {
    const key = String(e.key || '').toLowerCase();
    const code = String(e.code || '').toLowerCase();
    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    if (key === 'f12' || code === 'f12' || e.keyCode === 123) return true;
    if (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) return true;
    if (ctrlOrMeta && key === 'u') return true;
    if (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key)) return true;
    return false;
  }

  document.addEventListener('keydown', (e) => {
    if (!isBlockedShortcut(e)) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    notify();
    return false;
  }, true);

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    notify('El menú contextual está deshabilitado en este simulador.');
    return false;
  }, true);

  // Evita que la consola sea útil para inspeccionar estados internos del simulador.
  // Esto es una barrera de interfaz, no una medida criptográfica.
  try {
    const noop = () => undefined;
    ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir', 'trace', 'group', 'groupCollapsed', 'groupEnd'].forEach((method) => {
      try {
        Object.defineProperty(console, method, {
          value: noop,
          writable: false,
          configurable: false
        });
      } catch (_) {
        try { console[method] = noop; } catch (_) {}
      }
    });
  } catch (_) {}

  function ensureOverlay() {
    let overlay = document.getElementById('devtoolsGuard');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'devtoolsGuard';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="devtools-guard-card">
        <div class="devtools-guard-icon">🔒</div>
        <strong>Modo protegido</strong>
        <span>Cierra las herramientas de desarrollador para continuar con el simulador.</span>
      </div>`;
    document.body.appendChild(overlay);
    return overlay;
  }

  let dimensionSuspectCount = 0;
  function dimensionCheck() {
    // Umbrales altos para no confundir la barra normal del navegador con DevTools.
    const widthGap = Math.max(0, window.outerWidth - window.innerWidth);
    const heightGap = Math.max(0, window.outerHeight - window.innerHeight);
    const suspect = widthGap > 420 || heightGap > 320;
    dimensionSuspectCount = suspect ? Math.min(4, dimensionSuspectCount + 1) : Math.max(0, dimensionSuspectCount - 1);
    const overlay = ensureOverlay();
    overlay.classList.toggle('active', dimensionSuspectCount >= 2);
    overlay.setAttribute('aria-hidden', dimensionSuspectCount >= 2 ? 'false' : 'true');
  }

  // Si DevTools está abierto con el depurador activo, la sentencia debugger produce una
  // pausa perceptible. Al reanudar, se activa también la pantalla de protección.
  function debuggerTimingCheck() {
    const start = performance.now();
    debugger; // intencional: dificulta inspeccionar/modificar el flujo desde DevTools.
    const elapsed = performance.now() - start;
    if (elapsed > 160) {
      const overlay = ensureOverlay();
      overlay.classList.add('active');
      overlay.setAttribute('aria-hidden', 'false');
    }
  }

  window.addEventListener('resize', dimensionCheck, { passive: true });
  window.addEventListener('load', () => {
    ensureOverlay();
    dimensionCheck();
    setInterval(dimensionCheck, 900);
    setInterval(debuggerTimingCheck, 2200);
  });
})();
