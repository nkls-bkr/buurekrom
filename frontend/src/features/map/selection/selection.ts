import { createContext, useContext } from "react";

export const SelectionKind = {
  Field: "field",
  Location: "location",
} as const;

export type SelectionKind = (typeof SelectionKind)[keyof typeof SelectionKind];

export type Selection = { kind: SelectionKind; id: number } | null;

export interface SelectionContextValue {
  selection: Selection;
  select: (kind: SelectionKind, id: number) => void;
  toggle: (kind: SelectionKind, id: number) => void;
  clear: () => void;
  isSelected: (kind: SelectionKind, id: number) => boolean;
}

export const SelectionContext = createContext<SelectionContextValue | null>(
  null,
);

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }
  return ctx;
}
