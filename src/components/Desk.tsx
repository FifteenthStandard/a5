import { useBinderView } from '../contexts/BinderViewContext';
import type { BinderView } from '../Interfaces';
import type { Page, PageType } from '../Types';
import Binder from './Binder';
import LinedPage from './LinedPage';
import './Desk.css';
import Mat from './Mat';

export default function Desk(): React.ReactElement {
  const view = useBinderView();
  const binder = <Binder />;
  if (!view.binderOpen) {
    return <BinderClosedLayout view={view}>{binder}</BinderClosedLayout>;
  } else if (!view.ringsOpen) {
    return <BinderOpenLayout view={view}>{binder}</BinderOpenLayout>;
  } else {
    return <RingsOpenLayout view={view}>{binder}</RingsOpenLayout>;
  }
};

function BinderClosedLayout({ view, children }: { view: BinderView, children: React.ReactNode }): React.ReactElement {
  return (
    <div className="desk binder-closed">
      <Mat>
        {children}
        {view.detatchedPages.length > 0 && <Workspace view={view} />}
      </Mat>
    </div>
  );
};

function BinderOpenLayout({ view, children }: { view: BinderView, children: React.ReactNode }): React.ReactElement {
  return (
    <div className="desk binder-open rings-closed">
      <Mat>
        {children}
        {view.detatchedPages.length > 0 && <Workspace view={view} />}
      </Mat>
    </div>
  );
};

function RingsOpenLayout({ view, children }: { view: BinderView, children: React.ReactNode }): React.ReactElement {
  function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
  };

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const dragType = event.dataTransfer.getData('dragType');
    switch (dragType) {
      case 'workspace':
        view.insertPage(view.detatchedPages[0].id);
        break;

      case 'refills':
        const pageType = event.dataTransfer.getData('pageType') as PageType;
        view.addNewPage(pageType);
        break;
    }
  };

  return (
    <div className="desk binder-open rings-open">
      <Mat>
        <div onDragOver={handleDragOver} onDrop={handleDrop}>
          {children}
        </div>
        <Workspace view={view} />
      </Mat>
      <Refills />
    </div>
  );
};

function Workspace({ view }: { view: BinderView }): React.ReactElement {
  function onDragStart(event: React.DragEvent<HTMLDivElement>): void {
    event.dataTransfer.setData('dragType', 'workspace');
  };

  function handleDragOver(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
  };

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    const dragType = event.dataTransfer.getData('dragType');
    if (dragType !== 'binder') return;
    view.detatch();
  };

  const dragAttrs = view.ringsOpen ? { draggable: true, onDragStart } : {};

  return (
    <div className="workspace" onDragOver={handleDragOver} onDrop={handleDrop} {...dragAttrs}>
      <PageView page={view.detatchedPages[0]} />
    </div>
  );
};

function Refills(): React.ReactElement {
  function handleDragStart(event: React.DragEvent<HTMLDivElement>): void {
    event.dataTransfer.setData('dragType', 'refills');
    event.dataTransfer.setData('pageType', 'lined');
  };
  return (
    <div className="refills">
      <div draggable onDragStart={handleDragStart}>
        <LinedPage blank />
      </div>
    </div>
  );
};

function PageView({ page }: { page: Page | null; }): React.ReactElement | null {
  if (!page) return null;

  switch (page.type) {
    case 'lined':
      return (
        <LinedPage
          readonly
          key={page.id}
          page={page}
        />
      );

    default:
      return null;
  };
};
