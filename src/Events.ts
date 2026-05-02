import type { Index, Notes, Page } from './Types';

export type Event = {
  id: string;
  type: string;
}

export type NotesEvent =
  | StateInitializedEvent
  | PageUpdatedEvent
  | IndexUpdatedEvent;

export type StateInitializedEvent = Event & {
  type: 'stateInitialized';
  notes: Notes;
};

export type PageUpdatedEvent = Event & {
  type: 'pageUpdated';
  page: Page;
};

export type IndexUpdatedEvent = Event & {
  type: 'indexUpdated';
  index: Index;
};
