/*
 * RlonDSP
 * Copyright © 2026 RlonDSP. All rights reserved.
 * Based on Echomusic open-source project, modified and extended for RlonDSP.
 *
 * Stage 3: dynamic highlight for the player bar.
 * No SVG, no WebGL. Uses rAF throttling and CSS variables only.
 */

(function () {
  const PLAYER_SELECTOR = '.lg-player-bar';
  const TITLE_SELECTOR = '.lg-player-bar .mini-info strong';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setMotionEnabled(element, enabled) {
    element.style.setProperty('--lg-motion', enabled ? '1' : '0');
  }

  function updateHighlight(element, clientX, clientY) {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    element.style.setProperty('--lg-highlight-x', x.toFixed(4));
    element.style.setProperty('--lg-highlight-y', y.toFixed(4));
  }

  function resetHighlight(element) {
    element.style.setProperty('--lg-highlight-x', '0.5');
    element.style.setProperty('--lg-highlight-y', '0.5');
  }

  function bindPlayerBar(playerBar) {
    let pendingPointer = null;
    let frame = 0;

    setMotionEnabled(playerBar, !reducedMotion.matches);

    playerBar.addEventListener('pointermove', (event) => {
      pendingPointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (pendingPointer) {
          updateHighlight(playerBar, pendingPointer.x, pendingPointer.y);
          pendingPointer = null;
        }
      });
    });

    playerBar.addEventListener('pointerleave', () => {
      pendingPointer = null;
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      resetHighlight(playerBar);
    });

    document.addEventListener('wheel', () => {
      if (reducedMotion.matches) return;
      playerBar.style.setProperty('--lg-motion', '1');
      playerBar.classList.add('lg-player-bar--scrolling');
      window.clearTimeout(bindPlayerBar.scrollTimer);
      bindPlayerBar.scrollTimer = window.setTimeout(() => {
        playerBar.classList.remove('lg-player-bar--scrolling');
      }, 140);
    }, { passive: true });

    const title = playerBar.querySelector(TITLE_SELECTOR);
    if (title) {
      let lastTitle = title.textContent;
      const observer = new MutationObserver(() => {
        const current = title.textContent;
        if (current !== lastTitle) {
          lastTitle = current;
          if (reducedMotion.matches) return;
          playerBar.classList.remove('lg-player-bar--pulse');
          void playerBar.offsetWidth;
          playerBar.classList.add('lg-player-bar--pulse');
          window.setTimeout(() => playerBar.classList.remove('lg-player-bar--pulse'), 760);
        }
      });
      observer.observe(title, { childList: true, characterData: true, subtree: true });
    }
  }

  function init() {
    document.querySelectorAll(PLAYER_SELECTOR).forEach(bindPlayerBar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
