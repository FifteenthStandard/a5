import type { Notes, Page, PageType } from './Types';
import type { NotesEvent } from './Events';

export interface BinderView {
  binderOpen: boolean;
  ringsOpen: boolean;
  page: Page | null;
  leftPage: Page | null;
  previousPage(): void;
  nextPage(): void;
  toggleRings(): void;
  addNewPage(type: PageType): void;
  updatePage(content: string): void;
};

export interface NotesCollection {
  getSnapshot(): Notes;
  subscribe(callback: (event: NotesEvent) => void): () => void;
};
