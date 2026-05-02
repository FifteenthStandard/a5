import type { Index, Page } from './Types';

export type Event = {
  id: string;
  type: string;
}

export type NotesEvent =
  | PageUpdatedEvent
  | IndexUpdatedEvent;

export type PageUpdatedEvent = Event & {
  type: 'pageUpdated';
  page: Page;
};

export type IndexUpdatedEvent = Event & {
  type: 'indexUpdated';
  index: Index;
};
