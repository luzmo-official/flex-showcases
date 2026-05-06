import type { IconDefinition } from "@luzmo/icons";

export const toSvgString = (
  def: IconDefinition,
  size?: number,
): string => {
  const [w, h, path] = def.icon;
  const d = Array.isArray(path) ? path[0] : path;
  const displayW = size ?? w;
  const displayH = size ?? h;
  const pad = 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${displayW}" height="${displayH}" viewBox="${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}" fill="none"><path d="${d}" fill="currentColor"/></svg>`;
};
