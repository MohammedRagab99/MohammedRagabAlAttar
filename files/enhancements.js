/* RAGABVERSE enhancements: More menu, keyboard shortcuts, link hardening */
(function () {
  'use strict';

  // ---- "More" dropdown in the desktop nav ----
  const btn = document.getElementById('navMoreBtn');
  const panel = document.getElementById('navMorePanel');

  function setMore(open) {
    if (!btn || !panel) return;
    btn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
  }

  if (btn && panel) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setMore(panel.hidden);
    });
    panel.addEventListener('click', e => { if (e.target.closest('a')) setMore(false); });
    document.addEventListener('click', e => { if (!e.target.closest('#navMore')) setMore(false); });

    // Highlight "More" when one of its sections is the active one
    const syncActive = () => btn.classList.toggle('has-active', !!panel.querySelector('a.active'));
    new MutationObserver(syncActive).observe(panel, { subtree: true, attributes: true, attributeFilter: ['class'] });
    syncActive();
  }

  // ---- Keyboard: Esc closes menus, "/" or Ctrl/Cmd+K opens search ----
  document.addEventListener('keydown', e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;

    if (e.key === 'Escape') {
      setMore(false);
      const mb = document.getElementById('menuButton');
      if (mb && mb.getAttribute('aria-expanded') === 'true') mb.click();
      if (typeof closeSearchModal === 'function') closeSearchModal();
      return;
    }
    if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      if (typeof openSearchModal === 'function') {
        e.preventDefault();
        openSearchModal();
      }
    }
  });

  // ---- Search button hint ----
  const sb = document.getElementById('searchButton');
  if (sb) sb.title = 'Search (press / or Ctrl+K)';

  // ---- Harden external links added dynamically too ----
  function hardenLinks(root) {
    root.querySelectorAll('a[target="_blank"]').forEach(a => {
      const rel = (a.getAttribute('rel') || '').split(/\s+/);
      ['noopener', 'noreferrer'].forEach(r => { if (!rel.includes(r)) rel.push(r); });
      a.setAttribute('rel', rel.join(' ').trim());
    });
  }
  hardenLinks(document);
  new MutationObserver(() => hardenLinks(document)).observe(document.body, { childList: true, subtree: true });
})();
