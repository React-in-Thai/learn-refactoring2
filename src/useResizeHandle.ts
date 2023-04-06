import React from "react";

const MULTIPLY_SIZE = 10;
const FIX_ALT_SIZE = 1;

export default function useResizeHandle(
  target: React.MutableRefObject<HTMLDivElement | null>,
  options?: {
    minWidth?: string;
    maxWidth?: string;
    keyboardAdjustSize?: number;
  }
) {
  const { minWidth = "0px", maxWidth = "100%", keyboardAdjustSize = 1 } = options || {};
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  const [focusing, setFocusing] = React.useState(false);
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
  const resizeTargetRect = React.useCallback((newWidth: number) => {
    if (target.current) {
      target.current.style.width = `clamp(${minWidth}, ${Math.floor(
        newWidth
      )}px, ${maxWidth})`;
    }
  }, [minWidth, maxWidth, target])
  React.useEffect(() => {
    function resizeObject(event: MouseEvent | TouchEvent) {
      if (event.cancelable) {
        event.preventDefault();
      }
      const clientX = getClientX(event);

      if (target.current && dragging && clientX) {
        const objectRect = target.current.getBoundingClientRect();
        const newWidth = clientX - objectRect.left + dragOffset;
        resizeTargetRect(newWidth)
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
    return () => {};
  }, [dragOffset, dragging, getClientX, target]);
  const handleFocusStart = () => {
    setFocusing(true);
  }
  React.useEffect(() => {
    function resizeObject(event: KeyboardEvent) {
      if (!target.current) return;
      const objectRect = target.current.getBoundingClientRect();
      let adjustSize = event.altKey ? FIX_ALT_SIZE : keyboardAdjustSize;
      if (event.shiftKey) {
        adjustSize = adjustSize * MULTIPLY_SIZE;
      }
      if (event.key === 'ArrowLeft') {
        const newWidth = objectRect.width - adjustSize;
        resizeTargetRect(newWidth)
      }
      if (event.key === 'ArrowRight') {
        const newWidth = objectRect.width + adjustSize;
        resizeTargetRect(newWidth)
      }
    }
    function stopFocus() {
      setFocusing(false);
    }
    if (focusing) {
      document.addEventListener("keydown", resizeObject);
      document.addEventListener("focusout", stopFocus);
      return () => {
        document.removeEventListener("keydown", resizeObject);
        document.removeEventListener("focusout", stopFocus);
      };
    }
    return () => {};
  }, [focusing, target]);
  return {
    dragging,
    getDragHandlers: () => ({
      onTouchStart: handleStart,
      onMouseDown: handleStart,
      onFocus: handleFocusStart,
    }),
  };
}
