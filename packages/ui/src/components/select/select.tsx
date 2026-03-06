import { useCallback, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useSelectContext } from "./select-context";

// Re-export context module so test imports from "./select" keep working
export { Select, useSelectContext, collectItemLabels } from "./select-context";
export type { SelectProps, SelectContextValue } from "./select-context";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SelectTriggerProps = ComponentProps<"button">;
type SelectContentProps = ComponentProps<"div">;

interface SelectItemProps extends ComponentProps<"div"> {
  value: string;
  disabled?: boolean;
}

interface SelectValueProps extends ComponentProps<"span"> {
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// SelectTrigger
// ---------------------------------------------------------------------------

function SelectTrigger({
  className,
  children,
  ref,
  ...props
}: SelectTriggerProps) {
  const { refs, getReferenceProps, open, disabled } = useSelectContext();

  const setRef = useCallback(
    (node: HTMLButtonElement | null) => {
      refs.setReference(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [refs, ref],
  );

  const referenceProps = getReferenceProps(
    props as Record<string, unknown>,
  );

  return (
    <button
      type="button"
      ref={setRef}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      className={cn(
        [
          "flex items-center justify-between",                                // layout
          "w-full rounded-md px-3",                                           // size/spacing
          "h-9 text-sm text-foreground",                                        // shape/typo
          "border border-input bg-white shadow-sm dark:bg-neutral-950",       // bg/border
          "transition-[color,background-color,border-color,box-shadow] duration-200 ease-apple", // transition
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/20 focus-visible:border-primary/50", // focus glow
          "disabled:pointer-events-none disabled:opacity-50",                 // state
        ],
        className,
      )}
      {...referenceProps}
    >
      {children}
    </button>
  );
}

SelectTrigger.displayName = "SelectTrigger";

// ---------------------------------------------------------------------------
// SelectContent
// ---------------------------------------------------------------------------

function SelectContent({
  className,
  children,
  ref,
  ...props
}: SelectContentProps) {
  const { open, refs, floatingStyles, getFloatingProps, listRef } =
    useSelectContext();

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      refs.setFloating(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [refs, ref],
  );

  // Reset list ref when content unmounts
  useEffect(() => {
    if (!open) {
      listRef.current = [];
    }
  }, [open, listRef]);

  if (!open) return null;

  return (
    <div
      ref={setRef}
      role="listbox"
      style={floatingStyles as React.CSSProperties}
      className={cn(
        [
          "z-50 overflow-hidden",                       // layout
          "min-w-[8rem] rounded-md p-1",                // size/spacing
          "border border-border bg-white text-foreground shadow-md dark:bg-neutral-950", // bg/border
        ],
        className,
      )}
      {...getFloatingProps(props as Record<string, unknown>)}
    >
      {children}
    </div>
  );
}

SelectContent.displayName = "SelectContent";

// ---------------------------------------------------------------------------
// SelectItem
// ---------------------------------------------------------------------------

function SelectItem({
  className,
  children,
  value,
  disabled = false,
  ref,
  ...props
}: SelectItemProps) {
  const {
    selectedValue,
    selectValue,
    getItemProps,
    listRef,
    activeIndex,
    registerItem,
  } = useSelectContext();

  const itemRef = useRef<HTMLDivElement | null>(null);
  const indexRef = useRef<number>(-1);
  const isSelected = selectedValue === value;

  // Register this item's label for SelectValue to use
  useEffect(() => {
    const label =
      typeof children === "string"
        ? children
        : itemRef.current?.textContent ?? "";
    registerItem(value, label);
  }, [value, children, registerItem]);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      itemRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;

      // Register in listRef for useListNavigation
      if (node) {
        const index = listRef.current.indexOf(node);
        if (index === -1) {
          indexRef.current = listRef.current.length;
          listRef.current[indexRef.current] = node;
        } else {
          indexRef.current = index;
        }
      } else if (indexRef.current !== -1) {
        listRef.current[indexRef.current] = null;
      }
    },
    [ref, listRef],
  );

  const isActive =
    activeIndex !== null && listRef.current[activeIndex] === itemRef.current;

  return (
    <div
      ref={setRef}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      tabIndex={isActive ? 0 : -1}
      className={cn(
        [
          "relative flex w-full cursor-pointer select-none items-center", // layout
          "rounded-sm py-1.5 pl-8 pr-2",                                 // size/spacing
          "text-sm",                                                      // typo
          "outline-none transition-colors duration-150 ease-apple",        // transition
          "hover:bg-accent hover:text-accent-foreground",                 // hover
          "focus:bg-accent focus:text-accent-foreground",                 // focus
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", // disabled
        ],
        isSelected && "font-medium",
        className,
      )}
      {...getItemProps({
        ...props,
        onClick(event: React.MouseEvent<HTMLElement>) {
          if (disabled) return;
          selectValue(value);
          props.onClick?.(event as React.MouseEvent<HTMLDivElement>);
        },
        onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
          if (disabled) return;
          if (event.key === "Enter") {
            event.preventDefault();
            selectValue(value);
          }
          props.onKeyDown?.(event as React.KeyboardEvent<HTMLDivElement>);
        },
      } as Record<string, unknown>)}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {children}
    </div>
  );
}

SelectItem.displayName = "SelectItem";

// ---------------------------------------------------------------------------
// SelectValue
// ---------------------------------------------------------------------------

function SelectValue({
  placeholder,
  className,
  ref,
  ...props
}: SelectValueProps) {
  const { selectedValue, itemLabels } = useSelectContext();

  const displayText = selectedValue
    ? itemLabels.current.get(selectedValue) ?? selectedValue
    : placeholder;

  return (
    <span
      ref={ref}
      className={cn(
        !selectedValue && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {displayText}
    </span>
  );
}

SelectValue.displayName = "SelectValue";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
};
export type {
  SelectTriggerProps,
  SelectContentProps,
  SelectItemProps,
  SelectValueProps,
};
