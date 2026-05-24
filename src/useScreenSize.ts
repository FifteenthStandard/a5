import { useEffect, useMemo, useState } from 'react';

export type ScreenSize = {
  type: 'desktop' | 'mobile';
  orientation: 'portrait' | 'landscape';
  size: 'small' | 'medium' | 'large';
  zoom: number;
  height: number;
  width: number;
};

export function useScreenSize(): ScreenSize {
  const mmToPx = 3.78;
  const smallMediumBoundary = 150 * mmToPx;
  const mediumLargeBoundary = 325 * mmToPx;

  const type = useMemo(() => {
    return window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop';
  }, []);

  const [ dimensions, setDimensions ] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize(): void {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const orientation = useMemo(() => {
    return dimensions.width > dimensions.height ? 'landscape' : 'portrait';
  }, [ dimensions ]);

  const size = useMemo(() => {
    if (dimensions.width < smallMediumBoundary) return 'small';
    if (dimensions.width < mediumLargeBoundary) return 'medium';
    return 'large';
  }, [ dimensions ]);

  const zoom = useMemo(() => {
    return type === 'desktop' || orientation === 'landscape'
      ? 1
      : Math.min(dimensions.width / (74 * mmToPx) * 0.9, dimensions.height / (105 * mmToPx) * 0.9);
  }, [ dimensions ]);

  return {
    type,
    orientation,
    size,
    zoom,
    ...dimensions,
  };
};
