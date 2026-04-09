"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useUiHaptics } from "@/hooks/use-ui-haptics";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const items = ["About", "Projects", "Writing", "Photos", "Contact"];

type PillState = {
  left: number;
  width: number;
  opacity: number;
};

const hiddenPill = {
  left: 0,
  width: 0,
  opacity: 0,
} satisfies PillState;

export function FloatingMenu() {
  const { triggerMenuHaptic } = useUiHaptics();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const [pill, setPill] = useState<PillState>(hiddenPill);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scale, setScale] = useState(1);

  const movePill = useCallback((index: number) => {
    const button = buttonRefs.current[index];

    if (!button) {
      return;
    }

    setActiveIndex(index);
    setPill({
      left: button.offsetLeft,
      width: button.offsetWidth,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    movePill(activeIndex);

    function handleResize() {
      movePill(activeIndex);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex, movePill]);

  useEffect(() => {
    if (!wrapperRef.current || !navRef.current) {
      return;
    }

    function updateScale() {
      const wrapper = wrapperRef.current;
      const nav = navRef.current;

      if (!wrapper || !nav) {
        return;
      }

      const availableWidth = wrapper.clientWidth;
      const naturalWidth = nav.offsetWidth;

      if (!availableWidth || !naturalWidth) {
        return;
      }

      setScale(Math.min(1, availableWidth / naturalWidth));
    }

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(wrapperRef.current);
    resizeObserver.observe(navRef.current);

    window.addEventListener("resize", updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex justify-center sm:left-3 sm:right-3 sm:top-3"
    >
      <nav
        ref={navRef}
        aria-label="Primary"
        className="theme-motion-local shadow-surface pointer-events-auto origin-top flex items-center gap-2 rounded-full bg-(--surface) px-2 py-2"
        style={{ transform: `scale(${scale})` }}
      >
        <ul className="relative flex items-center gap-1">
          <li
            aria-hidden="true"
            className="shadow-surface-inset pointer-events-none absolute inset-y-0 left-0 rounded-full bg-(--surface) !transition-[transform,width,opacity,background-color,box-shadow] !duration-[var(--motion-duration)] !ease-[var(--motion-ease)]"
            style={{
              width: `${pill.width}px`,
              opacity: pill.opacity,
              transform: `translateX(${pill.left}px)`,
            }}
          />

          {items.map((item, index) => (
            <li key={item}>
              <button
                ref={(node) => {
                  buttonRefs.current[index] = node;
                }}
                type="button"
                onClick={triggerMenuHaptic}
                onMouseEnter={() => movePill(index)}
                onFocus={() => movePill(index)}
                className="relative rounded-full px-3 py-2 text-sm font-bold text-black/60 !transition-colors !duration-[var(--motion-duration)] !ease-[var(--motion-ease)] focus:outline-none sm:px-4 [html.dark_&]:text-white/60"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        <ThemeToggle />
      </nav>
    </div>
  );
}
