// Sharing helpers for challenge links, "ask your group" and worksheet links.

export const absoluteUrl = (path: string) => window.location.origin + path;

export const whatsappUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers and non-secure origins: fall back to a hidden textarea.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Uses the phone's share sheet when there is one. Returns false if unavailable or cancelled. */
export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  if (typeof navigator.share !== 'function') return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

/** Challenge links carry the quiz spec plus the score and time to beat. */
export const challengePath = (spec: string, score: number, seconds: number) => `/quiz/${spec}?beat=${score}-${Math.round(seconds)}`;

export function parseBeat(value: string | null): { score: number; seconds: number } | null {
  if (!value) return null;
  const m = /^(\d+)-(\d+)$/.exec(value);
  return m ? { score: Number(m[1]), seconds: Number(m[2]) } : null;
}

/** Worksheet links list question ids: /w/su1.su2.qd3 */
export const worksheetCode = (ids: string[]) => ids.join('.');
export const parseWorksheetCode = (code: string | undefined) => (code ? code.split('.').filter(Boolean) : []);
