/**
 * Adapts Markdown for Teams Adaptive Card TextBlocks.
 * Headings become bold. Bold, italics, links, and lists stay as Markdown.
 * Fenced and inline code are left untouched.
 */
export function markdownToTeams(text: string): string {
  if (!text || !text.includes('#')) return text;

  const placeholders: string[] = [];
  const stash = (match: string): string => {
    const index = placeholders.length;
    placeholders.push(match);
    return `\u0000CODE${index}\u0000`;
  };

  const out = text
    .replace(/```[\s\S]*?```/g, stash)
    .replace(/`[^`\n]+`/g, stash)
    .replace(/^#{1,6}\s+(.+)$/gm, '**$1**');

  return out.replace(/\u0000CODE(\d+)\u0000/g, (_m, i) => placeholders[Number(i)] ?? '');
}
