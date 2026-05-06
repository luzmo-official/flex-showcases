import type { OutputBlockData } from "@editorjs/editorjs";

import { blocks as defaultBlocks } from "./blocks-data";
import { DATASETS_DATA_FIELDS } from "./data";

export const CONTENTS_VERSION = "0.1.91";

const STORAGE_KEY = "editorjs-blocks";
const BLOCKS_VERSION_KEY = "editorjs-blocks-version";
const BLOCKS_VERSION = 2;

const loadBlocksFromStorage = (): OutputBlockData[] => {
  try {
    const storedVersion = localStorage.getItem(BLOCKS_VERSION_KEY);
    if (storedVersion && Number(storedVersion) === BLOCKS_VERSION) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as OutputBlockData[];
        }
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(BLOCKS_VERSION_KEY, String(BLOCKS_VERSION));
    }
  } catch {
    // Fall back to default blocks on parse error
  }
  return defaultBlocks as OutputBlockData[];
};

export const saveBlocksToStorage = (blocks: OutputBlockData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
    localStorage.setItem(BLOCKS_VERSION_KEY, String(BLOCKS_VERSION));
  } catch {
    // Storage might be full or disabled
  }
};

export const clearBlocksStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const report = {
  appServer: "https://api.luzmo.com/",
  authKey: import.meta.env.LUZMO_KEY || "",
  authToken: import.meta.env.LUZMO_TOKEN || "",
  body: { blocks: loadBlocksFromStorage() },
  contentsVersion: CONTENTS_VERSION,
  datasetsDataFields: DATASETS_DATA_FIELDS,
  footer: { text: "© 2026 Luzmo | Report Builder Demo" },
  header: { subtitle: "Retail Purchase Analysis", title: "Monthly Sales Report" },
  language: "en",
};
