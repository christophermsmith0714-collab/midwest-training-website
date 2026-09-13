export const FORM_ENDPOINT = 'https://formspree.io/f/myknwney';

// Keep all review copies inert. Enable only as a separately approved release step.
export const LIVE_SUBMISSIONS_ENABLED = false;

export async function submitInquiry(data, { live = false, fetchImpl = globalThis.fetch, signal } = {}) {
  if (!live) return { kind: 'preview', message: 'Preview complete — this request was not sent. On the published site, this is where we will confirm your submission.' };
  try {
    const response = await fetchImpl(FORM_ENDPOINT, {
      method: 'POST', body: data, headers: { Accept: 'application/json' }, signal,
    });
    if (!response.ok) return { kind: 'error', message: 'Your request could not be submitted. Your details are still here. Please try again or call 913-712-8077.' };
    return { kind: 'success', message: 'Your request has been submitted. Thank you for contacting Midwest Training & Consulting Services.' };
  } catch {
    return { kind: 'error', message: 'We could not confirm your submission. Please call 913-712-8077 before sending it again.' };
  }
}
