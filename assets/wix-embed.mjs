// Preserve the existing Wix wrapper's documented height and scrolling messages.
// Only layout information is sent, and only to this website's own parent origin.
export function connectWixEmbed(win = window, doc = document) {
  if (win.parent === win) return;
  let origin;
  try { origin = new URL(doc.referrer).origin; } catch { return; }
  if (!['https://www.midwest-training.com', 'https://midwest-training.com'].includes(origin)) return;
  let queued = false;
  let previousHeight = 0;
  const sendHeight = () => {
    queued = false;
    const height = Math.ceil(doc.body.getBoundingClientRect().height);
    if (height > 0 && height !== previousHeight) {
      previousHeight = height;
      win.parent.postMessage({ type: 'wix-iframe-height', height }, origin);
    }
  };
  const scheduleHeight = () => {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(sendHeight);
  };
  const scrollToHash = (hash = win.location.hash) => {
    let target;
    try { target = hash ? doc.getElementById(decodeURIComponent(hash.slice(1))) : null; } catch { return; }
    if (hash && !target) return;
    const offset = target ? Math.max(0, Math.round(target.getBoundingClientRect().top + win.scrollY - 24)) : 0;
    win.parent.postMessage({ type: 'scrollTo', offset }, origin);
  };
  const loaded = () => { scheduleHeight(); scrollToHash(); };
  if (doc.readyState === 'complete') loaded();
  else win.addEventListener('load', loaded, { once: true });
  win.addEventListener('resize', scheduleHeight);
  win.addEventListener('hashchange', () => scrollToHash());
  doc.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, win.location.href);
    if (destination.origin === win.location.origin && destination.pathname === win.location.pathname && destination.search === win.location.search && destination.hash) {
      win.requestAnimationFrame(() => scrollToHash(destination.hash));
    }
  });
  if (win.ResizeObserver) new win.ResizeObserver(scheduleHeight).observe(doc.body);
  doc.fonts?.ready.then(scheduleHeight);
  scheduleHeight();
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') connectWixEmbed();
