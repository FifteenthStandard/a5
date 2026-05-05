import { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { BinderService } from '../services/BinderService';
import type { PageType } from '../Types';
import type { BinderView } from '../Interfaces';

type BinderState = {
  binderOpen: boolean;
  ringsOpen: boolean;
  pageId: string | null;
};

export const BinderViewContext = createContext<BinderView>({} as BinderView);

export function BinderViewProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ state, setState ] = useState<BinderState>({ binderOpen: false, ringsOpen: false, pageId: null });
  const notes = useSyncExternalStore(BinderService.subscribe, BinderService.getSnapshot);

  const binderView = useMemo(function () {
    const pageIndex = !state.binderOpen ?
        -1 :
      state.pageId ?
        notes.index.findIndex(id => id === state.pageId) :
        notes.index.length;
    const leftPageId = pageIndex > 0 ? notes.index[pageIndex - 1] : null;
    const page = state.pageId ? notes.pages[state.pageId] : null;
    const leftPage = leftPageId ? notes.pages[leftPageId] : null;

    function closeBinder(): void {
      if (state.ringsOpen) return;
      setState(prev => ({ ...prev, binderOpen: false, pageId: null }));
    };

    function previousPage(): void {
      if (state.ringsOpen || !state.binderOpen) return;
      if (pageIndex === 0) return setState(prev => ({ ...prev, binderOpen: false, pageId: null }));
      setState(prev => ({ ...prev, pageId: notes.index[pageIndex - 1] }));
    };

    function nextPage(): void {
      if (state.ringsOpen || pageIndex === notes.index.length) return;
      setState(prev => ({ ...prev, binderOpen: true, pageId: notes.index[pageIndex + 1] }));
    };

    function toggleRings(): void {
      setState(prev => ({ ...prev, ringsOpen: !prev.ringsOpen }));
    };

    function addNewPage(type: PageType): void {
      if (!state.ringsOpen) return;
      const pageId = BinderService.addNewPageBefore(state.pageId, type);
      setState(prev => ({ ...prev, pageId }));
    };

    function updatePage(content: string): void {
      if (state.ringsOpen || !state.pageId) return;
      BinderService.updatePage(state.pageId, content);
    };

    return {
      binderOpen: state.binderOpen,
      ringsOpen: state.ringsOpen,
      page,
      leftPage,
      closeBinder,
      previousPage,
      nextPage,
      toggleRings,
      addNewPage,
      updatePage,
    } as BinderView;
  }, [ state, notes ]);

  return (
    <BinderViewContext.Provider value={binderView}>
      {children}
    </BinderViewContext.Provider>
  );
};

export function useBinderView(): BinderView {
  return useContext(BinderViewContext);
};
