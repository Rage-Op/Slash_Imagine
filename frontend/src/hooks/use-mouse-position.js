import { useEffect } from "react";

export function useMousePosition(ref, callback) {
  useEffect(() => {
    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const { top, left } = ref.current?.getBoundingClientRect() || {
        top: 0,
        left: 0,
      };

      if (callback) {
        callback({ x: clientX - left, y: clientY - top });
      }
    };

    ref.current?.addEventListener("mousemove", handleMouseMove);

    const nodeRef = ref.current;
    return () => {
      nodeRef?.removeEventListener("mousemove", handleMouseMove);
    };
  }, [ref, callback]);
}
