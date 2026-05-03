import { useBinderView } from '../contexts/BinderViewContext';
import type { Page } from '../Types';
import './Binder.css';
import LinedPage from './LinedPage';

export default function Binder(): React.ReactElement {
  const view = useBinderView();

  return (
    view.binderOpen
      ? <OpenBinder />
      : <ClosedBinder />
  );

  function ClosedBinder(): React.ReactElement {
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

  function OpenBinder(): React.ReactElement {
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
            <Page page={view.page} />
          </div>
        </div>
      </div>
    );
  };

  function Page({ page }: { page: Page | null }): React.ReactElement | null {
    if (!page) return null;

    switch (page.type) {
      case 'lined':
        return (
          <LinedPage
            key={page.id}
            page={page}
            updatePage={view.updatePage}
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
};
