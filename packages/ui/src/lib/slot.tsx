import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type Ref,
} from "react";

/**
 * Merges multiple refs into a single callback ref.
 */
function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): Ref<T> {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/**
 * Merges parent props onto a single child element.
 * Used to implement the `asChild` pattern (Radix-style).
 *
 * - Event handlers are composed (both parent and child run)
 * - className is concatenated
 * - style is shallow-merged
 * - refs are merged
 * - All other props: parent wins
 */
function Slot({
  children,
  ...parentProps
}: { children: ReactNode } & Record<string, unknown>) {
  const child = Children.only(children);

  if (!isValidElement(child)) {
    return null;
  }

  const childProps = child.props as Record<string, unknown>;
  const mergedProps: Record<string, unknown> = { ...parentProps };

  for (const key of Object.keys(childProps)) {
    if (key === "ref") continue;

    const parentValue = parentProps[key];
    const childValue = childProps[key];

    // Compose event handlers
    if (
      key.startsWith("on") &&
      typeof parentValue === "function" &&
      typeof childValue === "function"
    ) {
      mergedProps[key] = (...args: unknown[]) => {
        (childValue as Function)(...args);
        (parentValue as Function)(...args);
      };
    }
    // Concatenate className
    else if (key === "className") {
      mergedProps[key] = [parentValue, childValue].filter(Boolean).join(" ");
    }
    // Shallow-merge style
    else if (key === "style" && typeof parentValue === "object" && typeof childValue === "object") {
      mergedProps[key] = { ...(childValue as object), ...(parentValue as object) };
    }
    // Child value as fallback (parent wins for other props)
    else if (parentValue === undefined) {
      mergedProps[key] = childValue;
    }
  }

  // Merge refs
  const parentRef = parentProps.ref as Ref<unknown> | undefined;
  const childRef = (child as unknown as { ref?: Ref<unknown> }).ref;
  if (parentRef || childRef) {
    mergedProps.ref = mergeRefs(parentRef, childRef);
  }

  return cloneElement(child, mergedProps);
}

Slot.displayName = "Slot";

export { Slot, mergeRefs };