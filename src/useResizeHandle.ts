import React from "react";

export default function useResizeHandle(
  target: React.MutableRefObject<HTMLDivElement | null>,
  options?: { minWidth?: string; maxWidth?: string }
) {
  const { minWidth = "0px", maxWidth = "100%" } = options || {};
  const [dragging, setDragging] = React.useState(false);
  const [focusing, setFocusing] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const isTouchEvent = (
    event: MouseEvent | TouchEvent
  ): event is TouchEvent => {
    return Boolean(
      (event as TouchEvent).touches && (event as TouchEvent).touches.length
    );
  };

  const isMouseEvent = (
    event: MouseEvent | TouchEvent
  ): event is MouseEvent => {
    return Boolean(
      (event as MouseEvent).clientX || (event as MouseEvent).clientX === 0
    );
  };

  const getClientX = React.useCallback((event: MouseEvent | TouchEvent) => {
    let clientX;
    if (isMouseEvent(event)) {
      clientX = event.clientX;
    }
    if (isTouchEvent(event)) {
      clientX = event.touches[0].clientX;
    }
    return clientX as number;
  }, []);

  const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
    const clientX = getClientX(event.nativeEvent);
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setDragging(true);
    setDragOffset(rect.width - (clientX - rect.x));
  };

  const handleFocus = () => {
    setFocusing(true);
  };

  const handleBlur = () => {
    setFocusing(false);
  };

  React.useEffect(() => {
    function setNewWidth(newWidth: number) {
      if (target.current) {
        target.current.style.width = `clamp(${minWidth}, ${Math.floor(
          newWidth
        )}px, ${maxWidth})`;
      }
    }

    function resizeObject(event: MouseEvent | TouchEvent) {
      if (event.cancelable) {
        event.preventDefault();
      }
      const clientX = getClientX(event);

      if (target.current && dragging && clientX) {
        const objectRect = target.current.getBoundingClientRect();
        setNewWidth(clientX - objectRect.left + dragOffset);
      }
    }

    function stopResize() {
      setDragging(false);
    }

    if (dragging) {
      document.addEventListener("mousemove", resizeObject, { passive: false });
      document.addEventListener("mouseup", stopResize);
      document.addEventListener("touchmove", resizeObject, { passive: false });
      document.addEventListener("touchend", stopResize);

      return () => {
        document.removeEventListener("mousemove", resizeObject);
        document.removeEventListener("mouseup", stopResize);
        document.removeEventListener("touchmove", resizeObject);
        document.removeEventListener("touchend", stopResize);
      };
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (target.current) {
        const objectRect = target.current.getBoundingClientRect();
        const multiply = event.shiftKey ? (event.altKey ? 1 : 10) : 1;
        setNewWidth(
          objectRect.width +
            (event.key === "ArrowRight"
              ? 1
              : event.key === "ArrowLeft"
              ? -1
              : 0) *
              multiply
        );
      }
    };

    if (focusing) {
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }
    return () => {};
  }, [dragOffset, dragging, getClientX, maxWidth, minWidth, target, focusing]);
  return {
    dragging,
    getDragHandlers: () => ({
      onTouchStart: handleStart,
      onMouseDown: handleStart,
      onFocus: handleFocus,
      onBlur: handleBlur,
    }),
  };
}
