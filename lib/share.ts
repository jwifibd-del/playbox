export type ShareResult = 'shared' | 'copied' | 'unavailable';

interface ShareContentOptions {
  title: string;
  text?: string;
  url: string;
}

export async function shareContent({
  title,
  text,
  url,
}: ShareContentOptions): Promise<ShareResult> {
  if (typeof window === 'undefined') {
    return 'unavailable';
  }

  if (navigator.share) {
    await navigator.share({ title, text, url });
    return 'shared';
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return 'copied';
  }

  return 'unavailable';
}
