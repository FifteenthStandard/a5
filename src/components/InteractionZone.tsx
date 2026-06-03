type Props = {
  left?: string | undefined;
  right?: string | undefined;
  setHover?(hover: boolean): void;
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  height?: number;
};

export default function InteractionZone({ left, right, setHover, onClick, height = 1 }: Props): React.ReactElement {
  return (
    <div
      onMouseEnter={() => setHover && setHover(true)}
      onMouseLeave={() => setHover && setHover(false)}
      onClick={onClick}
      style={{
        height: '100%',
        left: left ? 0 : undefined,
        position: 'absolute',
        right: right ? 0 : undefined,
        top: 0,
        transform: `translateZ(${height * 30}mm)`,
        transformStyle: 'preserve-3d',
        width: left ? left : right ? right : '100%',
      }}
    />
  );
};
