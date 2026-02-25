import { toast } from 'sonner';

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

export function useWebShare() {
  const share = async (data: ShareData): Promise<void> => {
    const fullText = `${data.text} ${data.url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
      } catch (err: unknown) {
        // User dismissed the share dialog — not an error
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // Fallback to clipboard on any other error
        await copyToClipboard(fullText);
      }
    } else {
      await copyToClipboard(fullText);
    }
  };

  return { share };
}

async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  } catch {
    toast.error('Could not copy link. Please copy it manually.');
  }
}
