import { useState } from 'react';

type SwipeableProps = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
};

export default function Swipeable({ children, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }: SwipeableProps): React.ReactElement {
  const [ touchStart, setTouchStart ] = useState<{ x: number; y: number } | null>(null);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>): void {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    setTouchStart({ x: event.clientX, y: event.clientY });
  };

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>): void {
    if (!touchStart) return;

    event.stopPropagation();

    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;

    const direction = calculateSwipeDirection(deltaX, deltaY);

    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;

      case 'right':
        onSwipeRight?.();
        break;

      case 'up':
        onSwipeUp?.();
        break;

      case 'down':
        onSwipeDown?.();
        break;
    }

    setTouchStart(null);
  };

  function handlePointerCancel(): void {
    setTouchStart(null);
  };

  return (
    <div
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {children}
    </div>
  );
};

type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

function calculateSwipeDirection(deltaX: number, deltaY: number): SwipeDirection {
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  if (distance < 30) return null;

  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  if (angle > -45 && angle <= 45)   return 'right';
  if (angle > 45 && angle <= 135)   return 'down';
  if (angle > 135 || angle <= -135) return 'left';
  return 'up';
};
