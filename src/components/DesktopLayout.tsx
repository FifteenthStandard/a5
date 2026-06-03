import { Binder, Mat } from '.';
import './DesktopLayout.css';

export default function DesktopLayout(): React.ReactElement {
  return (
    <div className="desktop">
      <Mat />
      <Binder />
    </div>
  );
};
