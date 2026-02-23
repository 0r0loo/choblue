import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  useFloating,
  useClick,
  useDismiss,
  useListNavigation,
  useInteractions,
  offset,
  flip,
  type UseInteractionsReturn,
} from "@floating-ui/react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectContextValue {
  open: boolean;
  selectedValue: string | undefined;
  selectValue: (value: string) => void;
  disabled: boolean;
  activeIndex: number | null;
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getItemProps: UseInteractionsReturn["getItemProps"];
  refs: ReturnType<typeof useFloating>["refs"];
  floatingStyles: ReturnType<typeof useFloating>["floatingStyles"];
  listRef: React.MutableRefObject<(HTMLElement | null)[]>;
  itemLabels: React.MutableRefObject<Map<string, string>>;
  registerItem: (value: string, label: string) => void;
}

interface SelectProps {
  children: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively scans children to extract value-label pairs from SelectItem elements.
 * This allows SelectValue to display the correct label even before the dropdown
 * has been opened (i.e. before SelectItem components mount).
 */
function collectItemLabels(
  children: ReactNode,
  labels: Map<string, string>,
): void {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const element = child as ReactElement<{
      value?: string;
      children?: ReactNode;
    }>;

    // Check if this element has a value prop and string children (SelectItem pattern)
    if (
      element.props.value !== undefined &&
      typeof element.props.children === "string"
    ) {
      labels.set(element.props.value, element.props.children);
    }

    // Recurse into children (e.g. SelectContent wrapping SelectItems)
    if (element.props.children) {
      collectItemLabels(element.props.children, labels);
    }
  });
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error(
      "Select compound components must be used within <Select>",
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Select (Root Provider)
// ---------------------------------------------------------------------------

function Select({
  children,
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  name,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | undefined
  >(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedValue = isControlled ? controlledValue : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<(HTMLElement | null)[]>([]);
  const itemLabels = useRef<Map<string, string>>(new Map());

  // Collect labels from children props so SelectValue can display
  // the correct text even before the dropdown is opened
  const collectedLabels = useMemo(() => {
    const labels = new Map<string, string>();
    collectItemLabels(children, labels);
    return labels;
  }, [children]);

  useEffect(() => {
    for (const [k, v] of collectedLabels) {
      itemLabels.current.set(k, v);
    }
  }, [collectedLabels]);

  const registerItem = useCallback((value: string, label: string) => {
    itemLabels.current.set(value, label);
  }, []);

  const selectValue = useCallback(
    (value: string) => {
      if (!isControlled) {
        setUncontrolledValue(value);
      }
      onValueChange?.(value);
      setOpen(false);
      setActiveIndex(null);
    },
    [isControlled, onValueChange],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (disabled) return;
      setOpen(nextOpen);
      if (!nextOpen) {
        setActiveIndex(null);
      }
    },
    [disabled],
  );

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: handleOpenChange,
    placement: "bottom-start",
    middleware: [offset(4), flip()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    focusItemOnOpen: false,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    listNavigation,
  ]);

  return (
    <SelectContext
      value={{
        open,
        selectedValue,
        selectValue,
        disabled,
        activeIndex,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        refs,
        floatingStyles,
        listRef,
        itemLabels,
        registerItem,
      }}
    >
      {children}
      {name && <input type="hidden" name={name} value={selectedValue ?? ""} />}
    </SelectContext>
  );
}

Select.displayName = "Select";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Select, useSelectContext, collectItemLabels };
export type { SelectProps, SelectContextValue };
