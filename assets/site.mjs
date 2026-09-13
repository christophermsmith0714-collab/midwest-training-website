import { LIVE_SUBMISSIONS_ENABLED, submitInquiry } from './inquiry.mjs';

for (const form of document.querySelectorAll('.quote-form')) {
  const fieldset = form.querySelector('fieldset');
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector('[data-submit-label]');
  const status = form.querySelector('.form-status');
  const select = form.querySelector('[name="service"]');
  const requested = new URLSearchParams(location.search).get('service');
  if (requested && [...select.options].some(option => option.value === requested)) select.value = requested;
  const card = form.closest('.quote-card');
  const heading = card.querySelector('h2');
  const intro = card.querySelector('.form-intro');
  const originalCopy = { heading: heading.textContent, intro: intro.textContent, button: buttonLabel.textContent };
  function updateInquiryCopy() {
    const appWalkthrough = select.value === 'inspection-app';
    heading.textContent = appWalkthrough ? 'See the app in action.' : originalCopy.heading;
    intro.textContent = appWalkthrough ? 'Tell us about your inspections so we can discuss a walkthrough.' : originalCopy.intro;
    buttonLabel.textContent = appWalkthrough ? 'Request a walkthrough' : originalCopy.button;
  }
  updateInquiryCopy();
  select.addEventListener('change', updateInquiryCopy);
  fieldset.disabled = false;
  let pending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;
    pending = true;
    button.disabled = true;
    const original = buttonLabel.textContent;
    buttonLabel.textContent = LIVE_SUBMISSIONS_ENABLED ? 'Submitting…' : 'Checking preview…';
    status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const result = await submitInquiry(data, { live: LIVE_SUBMISSIONS_ENABLED, signal: controller.signal });
    clearTimeout(timeout);
    status.dataset.kind = result.kind;
    status.textContent = result.message;
    if (result.kind === 'success') {
      form.reset();
      updateInquiryCopy();
      form.dispatchEvent(new CustomEvent('mtcs:inquiry-submitted', { bubbles: true, detail: { service: data.get('service') } }));
    }
    buttonLabel.textContent = original;
    if (result.kind === 'success') updateInquiryCopy();
    button.disabled = false;
    pending = false;
  });
}

const menu = document.querySelector('.mobile-menu');
if (menu) {
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
}
