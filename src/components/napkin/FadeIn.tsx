import { useEffect, useRef, type ReactNode } from "react";
import { animate, inView } from "motion";
import { useReducedMotion } from "motion/react";

export function FadeIn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    // Keep server-rendered content visible without JavaScript.
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.style.opacity = "0";
    let animation: ReturnType<typeof animate> | undefined;
    const stop = inView(element, () => {
      animation = animate(element, { opacity: [0, 1] }, { duration: 0.65, ease: "easeOut" });
    });
    return () => {
      stop();
      animation?.stop();
      element.style.removeProperty("opacity");
    };
  }, [reducedMotion]);
  return <div ref={ref}>{children}</div>;
}
