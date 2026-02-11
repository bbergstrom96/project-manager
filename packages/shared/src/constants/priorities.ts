export const PRIORITIES = {
  P1: { label: "Priority 1", color: "#dc2626", value: 1 },
  P2: { label: "Priority 2", color: "#f97316", value: 2 },
  P3: { label: "Priority 3", color: "#3b82f6", value: 3 },
  P4: { label: "Priority 4", color: "#6b7280", value: 4 },
} as const;

export type PriorityKey = keyof typeof PRIORITIES;
