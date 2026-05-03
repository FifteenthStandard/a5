import { useBinderView } from '../contexts/BinderViewContext';
import type { BinderView } from '../Interfaces';
import type { Page } from '../Types';
import './Binder.css';
import LinedPage from './LinedPage';

export default function Binder(): React.ReactElement {
  const view = useBinderView();

  return (
    view.binderOpen
      ? <OpenBinder view={view} />
      : <ClosedBinder view={view} />
  );
};

function ClosedBinder({ view }: { view: BinderView }): React.ReactElement {
  function handleOpenBinder(): void {
    window.dispatchEvent(new Event('binderopen'));
    view.nextPage();
  };

  return (
    <div>
      <div className="buttons">
        <button onClick={handleOpenBinder}>Open Binder</button>
      </div>
      <div
        className="binder closed"
      />
    </div>
  );
};

function OpenBinder({ view }: { view: BinderView }): React.ReactElement {
  return (
    <div>
      <div className="buttons">
        <button onClick={view.previousPage}>Previous</button>
        <button onClick={view.nextPage}>Next</button>
        <button onClick={view.toggleRings}>{view.ringsOpen ? 'Close Rings' : 'Open Rings'}</button>
        <button onClick={() => view.addNewPage('lined')}>Add Lined Page</button>
      </div>
      <div className="binder open">
        <div className="left">
          <LeftPage page={view.leftPage} />
        </div>
        <div className="spine" />
        <div className="right">
          <PageView page={view.page} updatePage={view.updatePage} />
        </div>
      </div>
    </div>
  );
};

function PageView({ page, updatePage }: { page: Page | null; updatePage: (content: string) => void }): React.ReactElement | null {
  if (!page) return null;

  switch (page.type) {
    case 'lined':
      return (
        <LinedPage
          key={page.id}
          page={page}
          updatePage={updatePage}
        />
      );

    default:
      return null;
  };
};

function LeftPage({ page }: { page: Page | null }): React.ReactElement | null {
  if (!page) return null;

  switch (page.type) {
    case 'lined':
      return (
        <LinedPage
          key={page.id}
          blank
          obverse
        />
      );

    default:
      return null;
  };
};
