import React from "react";

export default function useResizeHandle(target, options) {
  const { minWidth = "0px", maxWidth = "100%" } = options || {};
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(0);
  console.log("dragOffset", dragOffset);
  const isTouchEvent = (event) => {
    return Boolean(event.touches && event.touches.length);
  };
  const isMouseEvent = (event) => {
    return Boolean(event.clientX || event.clientX === 0);
  };
  const getClientX = React.useCallback((event) => {
    let clientX;
    if (isMouseEvent(event)) {
      clientX = event.clientX;
    }
    if (isTouchEvent(event)) {
      clientX = event.touches[0].clientX;
    }
    return clientX;
  }, []);
  const handleStart = (event) => {
    const clientX = getClientX(event.nativeEvent);
    const rect = event.target.getBoundingClientRect();
    setDragging(true);
    setDragOffset(rect.width - (clientX - rect.x));
  };
  React.useEffect(() => {
    function resizeObject(event) {
      if (event.cancelable) {
        event.preventDefault();
      }
      const clientX = getClientX(event);

      if (target.current && dragging && clientX) {
        const objectRect = target.current.getBoundingClientRect();
        const newWidth = clientX - objectRect.left + dragOffset;
        target.current.style.width = `clamp(${minWidth}, ${Math.floor(
          newWidth
        )}px, ${maxWidth})`;
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
  }, [dragOffset, dragging, getClientX, maxWidth, minWidth, target]);
  return {
    dragging,
    getDragHandlers: () => ({
      onTouchStart: handleStart,
      onMouseDown: handleStart,
    }),
  };
}
