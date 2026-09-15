// Wix Custom Element tag: mtcs-website
// This wrapper adjusts its own height to the GitHub page and handles page scrolling.
(() => {
  const tag = 'mtcs-website';
  const website = 'https://christophermsmith0714-collab.github.io/midwest-training-website/';
  const websiteOrigin = new URL(website).origin;
  if (customElements.get(tag)) return;

  class MidwestWebsite extends HTMLElement {
    connectedCallback() {
      if (this._connected) return;
      this._connected = true;
      this.style.display = 'block';
      this.style.width = '100%';
      this.style.minWidth = '0';
      this.style.height = this._height ? `${this._height}px` : '1200px';
      if (!this._frame) {
        this._frame = document.createElement('iframe');
        this._frame.title = 'Midwest Training & Consulting Services website';
        this._frame.referrerPolicy = 'strict-origin-when-cross-origin';
        this._frame.style.cssText = 'display:block;width:100%;height:100%;border:0;margin:0;padding:0;';
        this._frame.src = website;
      }
      this._onMessage = event => {
        if (event.origin !== websiteOrigin || event.source !== this._frame.contentWindow) return;
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'wix-iframe-height' && Number.isFinite(data.height) && data.height > 0 && data.height <= 60000) {
          this._height = Math.ceil(data.height);
          this.style.height = `${this._height}px`;
        } else if (data.type === 'scrollTo' && Number.isFinite(data.offset) && data.offset >= 0 && data.offset <= 60000) {
          if (this._scrollFrame) window.cancelAnimationFrame(this._scrollFrame);
          this._scrollFrame = window.requestAnimationFrame(() => {
            this._scrollFrame = null;
            if (!this._connected) return;
            const top = Math.max(0, this.getBoundingClientRect().top + window.scrollY + data.offset);
            window.scrollTo({ top, left: 0, behavior: 'auto' });
          });
        }
      };
      window.addEventListener('message', this._onMessage);
      if (!this._frame.parentNode) this.appendChild(this._frame);
    }

    disconnectedCallback() {
      this._connected = false;
      window.removeEventListener('message', this._onMessage);
      if (this._scrollFrame) window.cancelAnimationFrame(this._scrollFrame);
      this._scrollFrame = null;
    }
  }
  customElements.define(tag, MidwestWebsite);
})();
