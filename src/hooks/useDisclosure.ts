import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface DisclosureOptions {
  initialOpen?: boolean;
}

export interface Disclosure {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export function useDisclosure(options: DisclosureOptions = {}): Disclosure {
  const { initialOpen = false } = options;
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}

/** Cierra al hacer clic/tap fuera del elemento referenciado o con Escape. */
export function useDismissOn<TElement extends HTMLElement>(
  isOpen: boolean,
  onDismiss: () => void,
): RefObject<TElement | null> {
  const ref = useRef<TElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent | TouchEvent) => {
      const element = ref.current;
      if (
        element &&
        "target" in event &&
        event.target instanceof Node &&
        !element.contains(event.target)
      ) {
        onDismiss();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onDismiss]);

  return ref;
}