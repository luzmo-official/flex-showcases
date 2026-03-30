/**
 * Friendly guidance copy for slot sections across the report builder.
 * Centralised here so wording stays consistent and is easy to update.
 */

export const guidedWizard = {
  step1: {
    emptyState:
      "No fields selected yet. Choose fields from the data panel to get started.",
    measure: {
      title: "What do you want to measure?",
      description: "Drag one or more numeric fields here — e.g. revenue, count, score.",
    },
    dimension: {
      title: "What do you want to break the data down by?",
      description: "Drag one or more category or date fields here — e.g. region, month.",
    },
  },
} as const

export const tableBuilder = {
  columns: {
    title: "Columns",
    description: "Which fields should be shown?",
  },
  rows: {
    title: "Rows",
    description: "How should the data be grouped?",
  },
  measures: {
    title: "Measures",
    description: "What should be calculated?",
  },
  measuresDisabled: "Add a Row field to enable Measures (Pivot mode).",
} as const
