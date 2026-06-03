import type { Page } from '../types';

export type PageState = {
  page: Page;
  positionLeft: number;
  positionRight: number;
  state: FlipState;
}

export type FlipState =
 | 'left'
 | 'peek-left'
 | 'peek-right'
 | 'right';

export default function PageContainer({ children, state }: { children: React.ReactNode, state: PageState }): React.ReactElement {
  const baseStyle = {
    height: '100%',
    position: 'absolute',
    transformStyle: 'preserve-3d',
    transformOrigin: '-2.5mm center',
    transition: 'transform 1s ease-in-out',
    width: '100%',
  } as React.CSSProperties;

  return (
    <div
      style={{
        ...baseStyle,
        transform: `translateZ(${getHeightFromState(state) / 4}mm) rotateY(${getRotationFromState(state)}deg)`,
      }}
    >
      {children}
    </div>
  );
};

function getHeightFromState(state: PageState): number {
  switch (state.state) {
    case 'left':
    case 'peek-left':
      return state.positionLeft;

    case 'peek-right':
    case 'right':
      return state.positionRight;
  }
};

function getRotationFromState(state: PageState): number {
  switch (state.state) {
    case 'left': return -180;
    case 'peek-left': return -175;
    case 'peek-right': return -5;
    case 'right': return 0;
  }
};
