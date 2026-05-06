import { useBinderView } from '../contexts/BinderViewContext';
import type { BinderView } from '../Interfaces';
import Binder from './Binder';
import LinedPage from './LinedPage';
import './Desk.css';

export default function Desk(): React.ReactElement {
  const view = useBinderView();
  const binder = <Binder />;
  if (!view.binderOpen) {
    return <BinderClosedLayout>{binder}</BinderClosedLayout>;
  } else if (!view.ringsOpen) {
    return <BinderOpenLayout>{binder}</BinderOpenLayout>;
  } else {
    return <RingsOpenLayout view={view}>{binder}</RingsOpenLayout>;
  }
};

function BinderClosedLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="desk binder-closed">
      {children}
    </div>
  );
};

function BinderOpenLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="desk binder-open rings-closed">
      {children}
    </div>
  );
};

function RingsOpenLayout({ view, children }: { view: BinderView, children: React.ReactNode }): React.ReactElement {
  return (
    <div className="desk binder-open rings-open">
      {children}
      <Workspace view={view} />
    </div>
  );
};

function Workspace({ view }: { view: BinderView }): React.ReactElement {
  function handleCilck(): void {
    view.addNewPage('lined');
  };

  return (
    <div className="workspace">
      <div onClick={handleCilck}>
        <LinedPage blank />
      </div>
    </div>
  );
};
