import './Divider.css';
import InteractionZone from './InteractionZone';

export default function Divider({ position, label, savePage, jumpToPage }: {  position: number, label?: string, savePage: (content: string) => void, jumpToPage: () => void }): React.ReactElement {
  const style = { left: `${(position-1)*18+5}%` };

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    savePage(`${position}:${event.target.value}`);
  };

  return (
    <div className="divider">
      <div className="divider-side front">
        <div className="divider-label pen" style={style}>
          <InteractionZone onClick={jumpToPage} />
          <textarea
            className="pen"
            value={label}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="divider-side back">
        <div className="divider-label pen" style={style}>
          <textarea
            className="pen"
            value={label}
            disabled
          />
        </div>
      </div>
    </div>
  );
};
