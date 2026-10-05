import type { ProgressStatus, ProgressTreeNode } from './types.js';

const STATUS_ICONS: Record<ProgressStatus, string> = {
  pending: '\u2022',
  inProgress: '\u25B6',
  success: '\u2713',
  error: '\u2717',
};

function formatMetadataValue(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (Array.isArray(value)) {
    const parts = value.map(formatMetadataValue).filter((v): v is string => v != null && v !== '');
    return parts.length > 0 ? parts.join(', ') : null;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (typeof value === 'object') {
    const values = Object.values(value as Record<string, unknown>);
    const strings = values
      .map(formatMetadataValue)
      .filter((v): v is string => v != null && v !== '');
    if (strings.length > 0) return strings.join(', ');
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Resolves `{{placeholder}}` tokens from AIPrompt `description_metadata`.
 * Missing keys are dropped so Teams never shows raw `{{key}}`.
 */
function interpolateProgressDescription(
  description: string,
  metadata?: Record<string, unknown>
): string {
  return description
    .replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      const formatted = formatMetadataValue(metadata?.[key]);
      return formatted ?? '';
    })
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}

/**
 * Formats the progress tree into text for an Adaptive Card.
 * Shows only nodes that have a description (leaf steps with meaningful info).
 */
export function formatProgressTree(node: ProgressTreeNode, depth = 0): string {
  const lines: string[] = [];

  if (node.description && depth > 0) {
    const label = interpolateProgressDescription(node.description, node.descriptionMetadata);
    if (label && !/\{\{[^}]+\}\}/.test(label)) {
      const indent = '    '.repeat(depth - 1);
      const icon = STATUS_ICONS[node.status];
      lines.push(`${indent}${icon} ${label}`);
    }
  }

  if (node.children) {
    for (const child of node.children) {
      lines.push(...formatProgressTree(child, depth + 1).split('\n').filter(Boolean));
    }
  }

  return lines.join('\n');
}
