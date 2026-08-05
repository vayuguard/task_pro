const COLORS = ['#0d9488', '#2dd4bf', '#4f46e5', '#f59e0b', '#ec4899', '#10b981'];

/** Lightweight DOM confetti burst — no dependency, self-cleaning. */
export function celebrate(pieces = 36) {
  if (typeof document === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  for (let i = 0; i < pieces; i++) {
    const el = document.createElement('span');
    el.className = 'confetti-piece';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.backgroundColor = COLORS[i % COLORS.length];
    el.style.animationDuration = `${2 + Math.random() * 1.6}s`;
    el.style.animationDelay = `${Math.random() * 0.35}s`;
    el.style.opacity = String(0.7 + Math.random() * 0.3);
    container.appendChild(el);
  }

  setTimeout(() => container.remove(), 4200);
}
