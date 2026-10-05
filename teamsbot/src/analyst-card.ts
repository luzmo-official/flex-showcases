const MAX_TEXT_CHARS = 12_000;

export interface AnalystCardState {
  progress: string;
  body: string;
  suffix: string | null;
  imageUrl: string | null;
  isError: boolean;
}

function clip(text: string): string {
  if (text.length <= MAX_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_TEXT_CHARS)}\n\n…`;
}

/** Adaptive Card shown for progress, the answer, and an optional chart. */
export function buildAnalystCard(state: AnalystCardState): Record<string, unknown> {
  const body: Record<string, unknown>[] = [];

  if (state.progress) {
    body.push({
      type: 'TextBlock',
      text: clip(state.progress),
      wrap: true,
      isSubtle: true,
      size: 'Small',
    });
  }

  if (state.body) {
    body.push({
      type: 'TextBlock',
      text: clip(state.body),
      wrap: true,
      color: state.isError ? 'Attention' : 'Default',
    });
  }

  if (state.suffix) {
    body.push({
      type: 'TextBlock',
      text: clip(state.suffix),
      wrap: true,
      isSubtle: true,
      size: 'Small',
    });
  }

  if (state.imageUrl) {
    body.push({
      type: 'Image',
      url: state.imageUrl,
      altText: 'Chart',
      size: 'Stretch',
    });
  }

  if (body.length === 0) {
    body.push({
      type: 'TextBlock',
      text: 'Processing…',
      wrap: true,
      isSubtle: true,
    });
  }

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.4',
    body,
  };
}
