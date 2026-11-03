export function useSwipeAction({ card, onTapPhoto, onSwipe, onPreview, onReset, getOverlayVisible, setSuppressClick, canSwipe }) {
  if (!card) {
    return () => {};
  }

  let gesture = null;

  function beginGesture(x, y) {
    if (getOverlayVisible()) return false;
    if (typeof canSwipe === "function" && !canSwipe()) return false;
    gesture = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      hasDragged: false
    };
    return true;
  }

  function updateGesture(x, y) {
    if (!gesture) return;
    gesture.currentX = x;
    gesture.currentY = y;
    const diff = gesture.currentX - gesture.startX;
    if (Math.abs(diff) > 8) {
      gesture.hasDragged = true;
      setSuppressClick(true);
      card.classList.add("dragging");
    }
    if (!gesture.hasDragged) return;
    onPreview(diff);
  }

  function finishGesture(x, y) {
    if (!gesture) return;
    gesture.currentX = x;
    gesture.currentY = y;
    const diff = gesture.currentX - gesture.startX;
    const yDiff = gesture.currentY - gesture.startY;
    const movedDistance = Math.hypot(diff, yDiff);
    const wasDrag = gesture.hasDragged;

    card.classList.remove("dragging");
    gesture = null;

    if (!wasDrag) {
      onReset();
      if (movedDistance <= 8) onTapPhoto(x);
      return;
    }

    if (Math.abs(diff) < 100) {
      setSuppressClick(true);
      onReset();
      return;
    }

    setSuppressClick(true);
    onSwipe(diff > 0 ? "right" : "left");
  }

  function cancelGesture() {
    gesture = null;
    onReset();
  }

  function handlePointerDown(event) {
    if (!beginGesture(event.clientX, event.clientY)) return;
    if (card.setPointerCapture) {
      card.setPointerCapture(event.pointerId);
    }
  }

  function handlePointerMove(event) {
    updateGesture(event.clientX, event.clientY);
    if (gesture?.hasDragged) {
      event.preventDefault();
    }
  }

  function handlePointerUp(event) {
    finishGesture(event.clientX, event.clientY);
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    if (!touch) return;
    beginGesture(touch.clientX, touch.clientY);
  }

  function handleTouchMove(event) {
    const touch = event.touches[0];
    if (!touch) return;
    updateGesture(touch.clientX, touch.clientY);
    if (gesture?.hasDragged) {
      event.preventDefault();
    }
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    if (!touch) return;
    finishGesture(touch.clientX, touch.clientY);
  }

  card.addEventListener("pointerdown", handlePointerDown);
  card.addEventListener("pointermove", handlePointerMove);
  card.addEventListener("pointerup", handlePointerUp);
  card.addEventListener("pointercancel", cancelGesture);
  card.addEventListener("touchstart", handleTouchStart, { passive: true });
  card.addEventListener("touchmove", handleTouchMove, { passive: false });
  card.addEventListener("touchend", handleTouchEnd);
  card.addEventListener("touchcancel", cancelGesture);

  return () => {
    card.removeEventListener("pointerdown", handlePointerDown);
    card.removeEventListener("pointermove", handlePointerMove);
    card.removeEventListener("pointerup", handlePointerUp);
    card.removeEventListener("pointercancel", cancelGesture);
    card.removeEventListener("touchstart", handleTouchStart);
    card.removeEventListener("touchmove", handleTouchMove);
    card.removeEventListener("touchend", handleTouchEnd);
    card.removeEventListener("touchcancel", cancelGesture);
  };
}
