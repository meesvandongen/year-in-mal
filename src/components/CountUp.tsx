import { useEffect, useRef, useState } from "react";
import { formatInteger } from "../lib/format";

interface CountUpProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
}

/** Counts up to `value` the first time it scrolls into view. */
export function CountUp({ value, format = formatInteger, duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState<number>();

  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        setCurrent(value * (1 - (1 - progress) ** 4));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(current ?? value)}
    </span>
  );
}
