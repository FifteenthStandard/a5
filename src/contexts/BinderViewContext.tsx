import { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { BinderService } from '../services/BinderService';
import type { Page, PageType } from '../Types';
import type { BinderView } from '../Interfaces';

type BinderState = {
  binderOpen: boolean;
  ringsOpen: boolean;
  pageId: string | null;
  detatchedPages: Page[];
};

export const BinderViewContext = createContext<BinderView>({} as BinderView);

export function BinderViewProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [ state, setState ] = useState<BinderState>({ binderOpen: false, ringsOpen: false, pageId: null, detatchedPages: [] });
  const notes = useSyncExternalStore(BinderService.subscribe, BinderService.getSnapshot);

  const binderView = useMemo(function () {
    const filteredIndex = notes.index.filter(id => !state.detatchedPages.some(page => page.id === id));

    const pageIndex = !state.binderOpen ?
        -1 :
      state.pageId ?
        filteredIndex.findIndex(id => id === state.pageId) :
        filteredIndex.length;
    const leftPageId = pageIndex > 0 ? filteredIndex[pageIndex - 1] : null;
    const page = state.pageId ? notes.pages[state.pageId] : null;
    const leftPage = leftPageId ? notes.pages[leftPageId] : null;

    function closeBinder(): void {
      if (state.ringsOpen) return;
      setState(prev => ({ ...prev, binderOpen: false, pageId: null }));
    };

    function previousPage(): void {
      if (state.ringsOpen || !state.binderOpen) return;
      if (pageIndex === 0) return setState(prev => ({ ...prev, binderOpen: false, pageId: null }));
      setState(prev => ({ ...prev, pageId: filteredIndex[pageIndex - 1] }));
    };

    function nextPage(): void {
      if (state.ringsOpen || pageIndex === filteredIndex.length) return;
      setState(prev => ({ ...prev, binderOpen: true, pageId: filteredIndex[pageIndex + 1] }));
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

    function detatch(): void {
      if (!state.ringsOpen || !state.pageId) return;
      setState(prev => ({ ...prev, detatchedPages: [ ...prev.detatchedPages, page! ], pageId: filteredIndex[pageIndex + 1] }));
    };

    function insertPage(pageId: string): void {
      if (!state.ringsOpen || !state.pageId) return;
      BinderService.movePage(pageId, state.pageId);
      setState(prev => ({ ...prev, detatchedPages: prev.detatchedPages.filter(page => page.id !== pageId), pageId }));
    };

    return {
      binderOpen: state.binderOpen,
      ringsOpen: state.ringsOpen,
      page,
      leftPage,
      detatchedPages: state.detatchedPages,
      closeBinder,
      previousPage,
      nextPage,
      toggleRings,
      addNewPage,
      updatePage,
      detatch,
      insertPage,
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
