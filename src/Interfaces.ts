import type { Index, Notes, Page, PageType } from './Types';
import type { NotesEvent } from './Events';

export interface BinderView {
  binderOpen: boolean;
  ringsOpen: boolean;
  page: Page | null;
  leftPage: Page | null;
  closeBinder(): void;
  previousPage(): void;
  nextPage(): void;
  toggleRings(): void;
  addNewPage(type: PageType): void;
  updatePage(content: string): void;
};

export interface NotesClient {
  savePage(page: Page): Promise<void>;
  saveIndex(index: Index): Promise<void>;
  getSnapshot(): Promise<Notes>;
  poll(): AsyncGenerator<NotesEvent>;
};

export interface NotesSource {
  getSnapshot(): Notes;
  handleNotesEvent(event: NotesEvent): Promise<void>;
  subscribe(callback: (event: NotesEvent) => void): () => void;
};
