import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  SelectionContext,
  type Selection,
  type SelectionKind,
} from "./selection";

interface SelectionProviderProps {
  children: ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selection, setSelection] = useState<Selection>(null);

  const select = useCallback((kind: SelectionKind, id: number) => {
    setSelection({ kind, id });
  }, []);

  const clear = useCallback(() => setSelection(null), []);

  const toggle = useCallback((kind: SelectionKind, id: number) => {
    setSelection((prev) =>
      prev && prev.kind === kind && prev.id === id ? null : { kind, id },
    );
  }, []);

  const isSelected = useCallback(
    (kind: SelectionKind, id: number) =>
      selection?.kind === kind && selection.id === id,
    [selection],
  );

  const value = useMemo(
    () => ({ selection, select, toggle, clear, isSelected }),
    [selection, select, toggle, clear, isSelected],
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}
