import { useState } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type SwipeHandlers = {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
};

export function useSwipe(onSwipe: (direction: SwipeDirection) => void): SwipeHandlers {
  const [ touchStart, setTouchStart ] = useState<{ x: number; y: number } | null>(null);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    setTouchStart({ x: event.clientX, y: event.clientY });
  };

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>): void {
    if (!touchStart) return;

    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;

    setTouchStart(null);
    const direction = calculateSwipeDirection(deltaX, deltaY);
    if (direction) {
      event.stopPropagation();
      event.preventDefault();
      onSwipe(direction);
    }
  };

  function onPointerCancel(): void {
    setTouchStart(null);
  };

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel
  };
};

function calculateSwipeDirection(deltaX: number, deltaY: number): SwipeDirection | null {
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  if (distance < 30) return null;

  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  if (angle > -45 && angle <= 45)   return 'right';
  if (angle > 45 && angle <= 135)   return 'down';
  if (angle > 135 || angle <= -135) return 'left';
  return 'up';
};
